const server = require('websocket').server;
const http   = require('http');
const readline = require('readline');
const clc = require('cli-color');

const DEFAULT_PORT = 1337;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("=> Choose Websocket Port (Leave default value if you don't know what to choose)  [default:" + DEFAULT_PORT + "] : ", paramPort => {
    let websocketPort = DEFAULT_PORT;
    if (paramPort != null && paramPort != "") {
        websocketPort = parseInt(paramPort);
    }
    let socket = new server({httpServer: http.createServer().listen(websocketPort)});

    console.log("Now open your browser to the following URL : https://www.tony-b.org/?ws_ports=" + websocketPort);
    socket.on('request', (request) => {
        let connection = request.accept(null, request.origin);

        process.stdout.write(clc.reset);
        connection.on('message', (message)=>{
            let data = JSON.parse(message.utf8Data);
            if (data["d"] != null) {
                process.stdout.write(clc.move.to(0,0));
                process.stdout.write(clc.erase.line);
                let nbCarets = Math.round(data["d"] / 3);
                for(let i = 0;i<nbCarets;i++) {
                    process.stdout.write(">");
                }
                process.stdout.write(clc.move.to(0,3));
            }
        });
        connection.send(JSON.stringify({"on":"db-out"}));
    });
});
