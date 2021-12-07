const server = require('websocket').server;
const http   = require('http');
const clc = require('cli-color');
const yargs = require('yargs');

const argv = yargs
    .option("port", {
        alias: "p",
        describe: "Port fro WebSocket connection",
        type: 'int',
    }).
    option("logToScreen", {
        alias: "ls",
        describe: "Log to Screen",
        type:'boolean'
    }).argv;

const DEFAULT_PORT = 1337;
let hasParentProcess = typeof process.send != "undefined";
let lastDbLevel = -1;
const LEVEL_GREEN = 60;
const LEVEL_ORANGE = 85;

let websocketPort = DEFAULT_PORT;
if(typeof argv.port == "number") {
    websocketPort = argv.port;
}

let socket = new server({httpServer: http.createServer().listen(websocketPort)});

console.log("Now open your browser to the following URL : https://www.tony-b.org/?ws_ports=" + websocketPort);

socket.on('request', (request) => {
    let connection = request.accept(null, request.origin);

    if(argv.logToScreen) {
        process.stdout.write(clc.reset);
    }
    if (hasParentProcess) {
        process.send({"event": "DB_OUT", "value": 9});
    }

    connection.on('message', (message)=>{
        let data = JSON.parse(message.utf8Data);
        if (data["d"] != null) {
            onDbChange(data["d"]);
        }
    });
    connection.send(JSON.stringify({"on":"db-out"}));
});

function onDbChange(db) {
    if(argv.logToScreen) {
        logToScreen(data["d"]);
    }
    let curDbLevel = dbLevel(db);
    if (hasParentProcess && curDbLevel != lastDbLevel) {
        process.send({"event":"DB_OUT","value":curDbLevel});
        lastDbLevel = curDbLevel;
    }
}

function logToScreen(d) {
    process.stdout.write(clc.move.to(0,0));
    process.stdout.write(clc.erase.line);
    let nbCarets = Math.round(data["d"] / 3);
    for(let i = 0;i<nbCarets;i++) {
        process.stdout.write(">");
    }
    process.stdout.write(clc.move.to(0,3));
}

function dbLevel(db) {
    if (db == 0) {
        return 0;
    }
    else if (db>0 && db < LEVEL_GREEN) {
        return 1;
    }
    else if (db>= LEVEL_GREEN && db < LEVEL_ORANGE) {
        return 2;
    }
    else {
         return 3;
    }
}