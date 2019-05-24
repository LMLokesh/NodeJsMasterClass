/*
* Example UDP Client
* Sending a message to a UDP server on port 6000
*
*/

// Dependencies
const dgram = require("dgram");

// Create a server
let client = dgram.createSocket('udp4');

// Define the message and pull it into a buffer
let messageString = "This is a message";
let messageBuffer = Buffer.from(messageString);

// Send off the message
client.send(messageBuffer, 6000, 'localhost', function(err){
    client.close();
})