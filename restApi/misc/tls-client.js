/*
* Example TLS Clint
* Connects to port 6000 and sends the word "ping"to server
*
*/

// Dependencies
const tls = require('tls');
const fs = require("fs");
const path = require("path");

// Server options
let options = { 
    'ca': fs.readFileSync(path.join(__dirname,'/../https/cert.pem')) // Only required because we'are using a self-signed certificate
};

// Define the message to send
let outboundMessage = "ping";

// Create a client
var client = tls.connect(6000, options, function(){
    // Send the message
    client.write(outboundMessage);
});

// Whe the server writes back, log what is says then kill the client
client.on('data', function(inboundMessage){
    let messageString = inboundMessage.toString();
    console.log("I wrote " + outboundMessage + " and they said "+ messageString);
    client.end();
})