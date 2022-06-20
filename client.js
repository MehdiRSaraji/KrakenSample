var websocket = require('websocket')
var WebSocketClient = websocket.client

const authCode = 'abcd'
let client = new WebSocketClient();

client.on('connect', function (connection) {
    connection.on('message', (message) => {
        console.log(message.utf8Data);
    });

    connection.on('close', function (code, reason) {
        console.log(`connection close afther 5 seconds\n${code}-${reason}`);
    })

    if (connection.connected)
        connection.send(authCode);
})

client.connect('ws://localhost:8080', 'echo-protocol');