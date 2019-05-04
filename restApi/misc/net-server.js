/*
* Example TCP (Net) Server
* Listens to port 6000 and sends the word "pong" to client
*
*/

// Dependencies
const net = require('net');

// Create the server
let server = net.createServer(function(connection){
    // Send the work "pong"
    let outboundMessage = "pong";
    connection.write(outboundMessage);

    // When teh client writes something, log it out
    connection.on('data', function(inboundMessage){
        let messageString = inboundMessage.toString();
        console.log("I wrote " + outboundMessage + " and they said "+ messageString);
    })
});

// Listens
server.listen(6000);