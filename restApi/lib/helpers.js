/*
* Helpers for various tasks
*
*/

// Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');


// Container for all the helpers
let helpers = {}

// Create a SHA256 hash
helpers.hash = (str)=>{
    if(typeof(str) == 'string'&& str.length > 0 ){
        let hash = crypto.createHmac('sha256', config.hasingSecret).update(str).digest('hex');
        return hash;
    }else{
        return false;
    }
}

// Parse a JSOn String to an object in all cases, withough throwing
helpers.parseJsonToObject = (str) => {
    try {
        let obj = JSON.parse(str);
        // console.log("Checking data", obj);
        return obj;
    } catch (error) {
        return {}
    }
}

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strlength) => {
    strlength = typeof(strlength) == 'number' && strlength > 0 ? strlength : false;
    if(strlength){
        // Define all the passible characters that could go into a string
        let possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string
        let str = '';
        for (let i = 1; i <= strlength; i++){
            // Get a random character from the possibleChars string
            let randomCharacter = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
            //Append this character tot he final string
            str +=randomCharacter;
        }
        // Return the final string
        return str;
    }else {
        return false;
    }
}

// Send an SMS message via Twilio
helpers.sendTwilioSms = (phone, msg, callback) =>{
    // Validate parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? true : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length < 1600 ? msg.trim() : false;
    if( phone && msg){
        // Configure the request payload
        let payload = {
            'From' : config.twilio.fromPhone,
            'To': '+91'+ phone,
            'Body' : msg
        };

        // Stringify the payload
        let stringPayload = querystring.stringify(payload);

        // Configure the request details
        let reqestDetails = {
            'protocal' : 'https:',
            'hostname' : 'api.twilio.com',
            'method' : 'POST',
            'path' : '/2010-04-01/Accounts/'+ config.twilio.accountSid+'/Messages.json',
            'auth' : config.twilio.accountSid + ':' + config.twilio.authToken,
            'headers' : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' : Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        let req = https.request(reqestDetails, (res) => {
            // Grab the status of the sent request
            let status = res.statusCode;
            // Callback successfully if the request went through
            if(status == 200 || status == 201){
                callback(false);
            }else {
                callback('Status code returned was ' + status);
            }
        });

        // Bind to the rror event so it doesn't get thrown
        req.on('error', (err)=> {
            callback(err);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();
    }else {
        callback('Given parameters were missing or invalid');
    }
 
}

// exporting module
module.exports = helpers;