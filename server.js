/*
    here did not do some important points of code such as:
        error handling
        data validation
        modular code
        and ...
    because I did try solving with the best practice approach and codes be simple.
*/
var websocket = require('websocket')
var http = require('http')
const WebSocketServer = websocket.server
var WebSocketClient = websocket.client

const authCode = 'abcd'
//this is such as session manager; in real world we must use session manager such as mongo or redis and other in RAM db.
let clients =  {}

let server = http.createServer((req, res) => { }).listen(8080);
const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

//Create WebSocket server------------------------------------
wsServer.on('request', function (request) {
    var connection = request.accept('echo-protocol', request.origin);
    clients[request.key] = { authorization: null, connection }
    setTimeout(closeClient, 5000,request.key);

    connection.on('message', function (message) {
        if (message.utf8Data === authCode) {
            clients[request.key].authorization = true
        }
    });
});

//Send data for all clients afther every tick-----------------
const broadcast = (message) => {
    for (const key in clients) {
        if (clients[key].authorization)
            clients[key].connection.send(message.utf8Data)
    }
}

//WebSocket to Kraken-----------------------------------------
const data = `{ "event": "subscribe", "pair": ["XBT/USD","XBT/EUR","ADA/USD"], "subscription": { "name": "ticker" } }`
let wsKraken = new WebSocketClient();

wsKraken.on('connect', function (cnKraken) {
    cnKraken.on('message', (message) => {
        broadcast(message)
    });

    if (cnKraken.connected)
        cnKraken.send(data);
})

wsKraken.connect('wss://ws.kraken.com', 'echo-protocol');

//Close unauthorize connection
const closeClient = (key) => {
    if (!clients[key].authorization) {
        clients[key].connection.close(1000, 'UNAUTHORIZE')
        delete clients[key]
    }
}