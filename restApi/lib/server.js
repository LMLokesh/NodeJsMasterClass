/*
* Server-related tasks
* 
*/
// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
// let _data = require('./lib/data');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require("util");
const debug = util.debuglog("server");

// TESTING
//  @TODO delete this
// _data.delete('test', 'newFile', (err)=>{
//     debug("This was the error", err);
// })

// @TODO GET RID OF THIS
// helpers.sendTwilioSms('9035371392', 'Hello!', (err) => {
//     debug('This was the error', err);
// })

// Instantiate the server module object
let server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer( (req, res)=> {
    server.unifiedServer(req, res);
})

// Instantiate the HTTPS server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))

};
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res);
})

// All the server logic for both the http and https server
server.unifiedServer = (req, res) => {
    // Get the URL and parse it
    let parsedUrl = url.parse(req.url, true);

    // Get the Path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');
    debug(trimmedPath)
    // Get the query string as an object
    let queryStringObj = parsedUrl.query;

    // Get the http Method
    let method = req.method.toLocaleLowerCase();

    // Get the headers as an object
    let headers = req.headers;

    // Get the payload, if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data)=> {
        buffer += decoder.write(data);
    });
    req.on('end', ()=>{
        buffer += decoder.end();
        debug("trimed path", trimmedPath);
        // Choose the handler this request should go to. It one is not found, use the notFound handler.
        let chosenHnadler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        let data = {
            'trimedPath' : trimmedPath,
            'queryStringObject' : queryStringObj,
            'method': method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        };
        // Router the request to the handler specified in the router
        chosenHnadler(data, (statusCode, payload)=>{
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            // Ue the payload called back by the handler, or default to the empty Object.
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to the string
            let payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-type', 'application/json')
            res.writeHead(statusCode);         
            res.end(payloadString);

            // If the response is 200, print green otherwise print red
            if(statusCode == 200){
                debug('\x1b[33m%s\x1b[0m', method.toUpperCase() + ' /'  + trimmedPath + ' ' + statusCode);
            } else {
                debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /'  + trimmedPath + ' ' + statusCode);
            }
            
        })

        // // Log the Playload
        // debug("Request received with this payload: ", buffer);

        // // Log the request path
        // debug("Request received on path: "+ trimmedPath);
        // debug("with Method: "+ method); 
        // debug(" and with these query string parametes: ", queryStringObj);
        // debug('Request recieved with these headers', headers);
    })
}

// Define a request router
server.router = {
    'ping': handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens,
    'checks'  : handlers.checks
}

// Init script
server.init = () => {
    // Start the http server
    server.httpServer.listen(config.httpPort, ()=> { 
        console.log('\x1b[36m%s\x1b[0m', "The sever is listening on part "+config.httpPort+" in "+config.envName+" now");
    });

    // Start the HTTPs server
    server.httpsServer.listen(config.httpsPort, () => { 
        console.log('\x1b[35m%s\x1b[0m', "The server is listening on port "+config.httpsPort+" in "+config.envName+" now");
    })
}

// Export the module
module.exports = server;