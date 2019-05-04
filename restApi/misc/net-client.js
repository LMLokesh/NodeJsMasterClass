/*
* Example TCP (Net) Clint
* Connects to port 6000 and sends the word "ping"to server
*
*/

// Dependencies
const net = require('net');

// Define the message to send
let outboundMessage = "ping";

// Create a client
var client = net.createConnection({ 'port': 6000}, function(){
    // Send the message
    client.write(outboundMessage);
});

// Whe the server writes back, log what is says then kill the client
client.on('data', function(inboundMessage){
    let messageString = inboundMessage.toString();
    console.log("I wrote " + outboundMessage + " and they said "+ messageString);
    client.end();
})