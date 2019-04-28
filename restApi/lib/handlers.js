/*
* Request handlers
*
*/

//Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

// Define the handlers
var handlers = {}

// Users
handlers.users = (data, callback) =>{
    let acceptableMethods =  ['post', 'get', 'put', 'delete'];
    if( acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data, callback);
    }else {
        callback(405);
    }
}

// Container for the users sub menthods
handlers._users = { };

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
    // Check that all required fields are filled out
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length  > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length ==10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) ==  'string'&& data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let tosAgreement = typeof(data.payload.tosAgreement) ==  'boolean'&& data.payload.tosAgreement == true ? true : false;
    if(firstName && lastName && phone && password && tosAgreement){
        // Make sure that the user doesnt already exist
            _data.read('users', phone, (err, data)=>{
                if(err){
                    console.log("validation passed")
                    // Hash the password
                    let hashedPassword = helpers.hash(password);

                    // Create the user object
                    if(hashedPassword){
                        let userObject = {
                            'firstName' : firstName,
                            'lastName': lastName,
                            'phone': phone,
                            'hashedPassword' : hashedPassword,
                            'tosAgreement' : true 
                        };

                        // Store the user
                        _data.create('users', phone, userObject, (err)=>{
                            if(!err){
                                callback(200);
                            }else{
                                console.log(err);
                                callback(500, {'Error' : 'Could not create the new user'});
                            }
                        })
                    }else{
                        callback(500, {'Error': 'Could not has the user\'s password'});
                    }
                }else{
                    // User already exists
                    callback(400, {'Error': 'A user with that phone number already exists'});
                }
            })
    }else{
        callback(400, {'Error': 'Missing required fields'});
    }
}
// Users - get
// Required data: phone
// Optional Data: none
// @ToDo Only let an authenticated user acces their object. Dont let them access anyones object.
handlers._users.get = (data, callback) => {
    // Check that the phone number is valid
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : null;
    if(phone){
        // Get the token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if(tokenIsValid){
                //Looking the user
                _data.read('users', phone, (err, data)=>{
                    if(!err && data){
                        // Remove the hashed password from the user object before returning it to the requested
                        delete data.hashedPassword;
                        callback(200, data);
                    }else {
                        callback(404)
                    }
                })
            }else {
                callback(403, {'Error' : "Missing the reuqired token in header, or token is expired"});
            }
        })
    }else{
        callback(400, {'Error': 'Missing required field'});
    }
}

// users - put 
// Required data : phone
// Optional data : firstName, lastName, password ( at least one must be specified)
// @ToDo Only let an authenticated user update their own object. Don't let them update another ones
handlers._users.put = (data, callback) =>{
    // console.log(data);
    // Check for the required field
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length ==10 ? data.payload.phone.trim() : false;
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length  > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let password = typeof(data.payload.password) ==  'string'&& data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    // Get the token from the headers
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if(tokenIsValid){ 
            // Error if the phone invalid
            if(phone){
                // Error if nothing is set to update
                if(firstName || lastName || password){
                    // Loopup the User
                    _data.read('users', phone, (err, userData)=>{
                        if(!err && data){
                            // Update the fields necessary
                            if(firstName){
                                userData.firstName = firstName;
                            }
                            if(lastName){
                                userData.lastName = lastName;
                            }
                            if(password){
                                userData.password = helpers.hash(password);
                            }
                            // Store the new updates
                            _data.update('users', phone, userData, (err)=> {
                                if(!err){
                                    callback(200);
                                }else{
                                    console.log(err);
                                    callback(500, {'Error': 'Couldn\'t update the user'})
                                }
                            })
                        }else{
                            callback(400, {'Error': 'This specified user does not exist'})
                        }
                    })
                }else {
                    callback(400, {'Error': 'Missing fields to update'})
                }
            }else {
                callback(400, {'Error': 'Missing required field'})
            }
        }else {
            callback(403, {'Error' : "Missing the reuqired token in header, or token is expired"});
        }
    })
}

// Users - delete
// Required Field : phone
// @ToDo Only let an authenticated user delete their own object. Don't let them delete another ones
// @ToDo Cleanup (delete) any other data files associated with this user
handlers._users.delete =  (data, callback) => {
    // Check that the phone number is valid
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : null;
    // Get the token from the headers
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if(tokenIsValid){ 
            if(phone){
                //Looking the user
                _data.read('users', phone, (err, userData)=>{
                    if(!err && userData){
                         _data.delete('users',phone, (err)=> {
                             if(!err){
                                 // Delete each of the checks associated with the user
                                 let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                 let checksToDelete = userChecks.length;
                                 if(checksToDelete > 0){
                                    let checksDeleted = 0;
                                    let deletionErrors = false;
                                    // Loop through the checks
                                    userChecks.forEach(checkId => {
                                        // Delete the check
                                        _data.delete('checks', checkId, err => {
                                            if(!err){
                                                deletionErrors = true;
                                            }
                                            checksDeleted++;
                                            if(checkDeleted == checksToDelete){
                                                if(!deletionErrors){
                                                    callback(200)
                                                }else {
                                                    callback(500, {'Error': 'Errors encountered while attempting to delete all of the user\'s checks. All cheks may not have been deleted from the system successfully'});
                                                }
                                            }
                                        })
                                    })
                                 }else{
                                     callback(200)
                                 }
                                callback(200);
                             }else{
                                callback(400, {'Error': 'Couldn\'t delete the specified user'})
                             }
                         })
                    }else {
                        callback(400, {'Error': 'Could not find the specified user'})
                    }
                })
            }else{
                callback(400, {'Error': 'Missing required field'});
            }
        }else {
            callback(403, {'Error' : "Missing the reuqired token in header, or token is expired"});
        }
    })
}


// Tokens
handlers.tokens = (data, callback) =>{
    let acceptableMethods =  ['post', 'get', 'put', 'delete'];
    if( acceptableMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data, callback);
    }else {
        callback(405);
    }
}


// Container for all the tokens methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length ==10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) ==  'string'&& data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    
    if(phone && password){
        // Lookup the user who mathes that phone number
        _data.read('users', phone, (err, userData)=> {
            if(!err && data){
                // Hash the sent password and compare it to the password stored in the user object
                let hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){
                    // If valid, create a new token with a random name. Set expiration date 1 hour in the feature
                    let tokenId = helpers.createRandomString(20);

                    let expires = Date.now() + 1000 * 60 * 60;
                    let tokenObject = {
                        'phone': phone,
                        'id' : tokenId,
                        'expires' : expires
                    };

                    // Store the token
                    _data.create('tokens', tokenId, tokenObject, (err)=> {
                        if(!err){
                            callback(200, tokenObject);
                        }else {
                            callback(500, { 'Error' : "Could not create the new token"});
                        }
                    })
                }else {
                    callback(400, {'Error': 'Password did not match the specified user\'s stored password'});
                }
            }else {
                callback(400, {'Error': 'Could not find the specified user'});
            }
        })
    }else {
        callback(400, {'Error': 'Missing required field(s)'});
    }
}

// Tokens - get
// required data : id
// Optional data : none
handlers._tokens.get = (data, callback) => {
    // Check that the id is valid
    // Check that the tokenId is valid
    let tokenId = typeof(data.queryStringObject.tokenId) == 'string' && data.queryStringObject.tokenId.trim().length == 20 ? data.queryStringObject.tokenId.trim() : null;
    if(tokenId){
        //Looking the token
        _data.read('tokens', tokenId, (err, tokenData)=>{
            if(!err && tokenData){
                callback(200, tokenData);
            }else {
                callback(404)
            }
        })
    }else{
        callback(400, {'Error': 'Missing required field'});
    }
}

// Tokens - put
// Required data : id, extend
// Optional data : none
handlers._tokens.put = (data, callback) => {
    let tokenId = typeof(data.payload.tokenId) == 'string' && data.payload.tokenId.trim().length == 20 ? data.payload.tokenId.trim() : null;
    let extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    if(tokenId && extend){
        // Lookup the token
        _data.read('tokens', tokenId, (err, tokenData) => {
            if(!err && tokenData){
                // Check to the make sure the token isn't already expired
                if(tokenData.expires > Date.now()){
                    // Set the expiration an hour from now 
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new updates
                    _data.update('tokens', tokenId, tokenData, (err)=> {
                        if(!err){
                            callback(200)
                        }else {
                            callback(500, {'Error': 'Could not update the token\'s expiration'});
                        }
                    })
                }else {
                    callback(400, {'Error': 'The token has already expired, and cannot be extended'});
                }
            }else {
                callback(400, {'Error': 'Specified token does not exist'});
            }
        })
    }else {
        callback(400, {'Error': 'Missing required fields or fields(s) are invalid'});
    }
}

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
    // Check that the tokenId is valid
    let tokenId = typeof(data.queryStringObject.tokenId) == 'string' && data.queryStringObject.tokenId.trim().length == 20 ? data.queryStringObject.tokenId.trim() : null;
    if(tokenId){
        //Looking the user
        _data.read('tokens', tokenId, (err, data)=>{
            if(!err && data){
                 _data.delete('tokens',tokenId, err=> {
                     if(!err){
                        callback(200);
                     }else{
                        callback(400, {'Error': 'Couldn\'t delete the specified token'})
                     }
                 })
            }else {
                callback(400, {'Error': 'Could not find the specified token'})
            }
        })
    }else{
        callback(400, {'Error': 'Missing required field'});
    }
}

// Verofu of a given toke id is currently valid for given user
handlers._tokens.verifyToken = (tokenId, phone, callback) =>{
    // Lookup the token
    _data.read('tokens', tokenId, (err, tokenData) => {
        if(!err && tokenData){
            // Check that the token is for the given user and has not expired
            console.log("token Data", tokenData);
            if(tokenData.phone == phone && tokenData.expires > Date.now()){
                callback(true);
            }else {
                console.log("hitting Here");
                callback(false);
            }
        }else {
            callback(false);
        }
    })
}

// Checks
handlers.checks = (data, callback) =>{
    let acceptableMethods =  ['post', 'get', 'put', 'delete'];
    if( acceptableMethods.indexOf(data.method) > -1){
        handlers._checks[data.method](data, callback);
    }else {
        callback(405);
    }
}

// Container for all the checks methods
handlers._checks = {};

// Checks - post
// Required data: protocal, url, method, successCodes, timeoutSeconds
// Optional data: none

handlers._checks.post = function(data, callback){
    // Validate inputs
    let protocal = typeof(data.payload.protocal) == 'string' && ['https', 'http'].indexOf(data.payload.protocal) > -1 ? data.payload.protocal : false;
    let url = typeof(data.payload.url) == 'string'&& data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    let method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    let successCodes = typeof(data.payload.successCodes) == 'object'&& data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0  ? data.payload.successCodes: false;
    let timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number'&& data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <=5 ?data.payload.timeoutSeconds : false;

    if(protocal && url && method && successCodes && timeoutSeconds){
        // Get the token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        console.log("Validation success");
        // Lookup the user by reading the token
        _data.read('tokens', token, (err, tokenData)=>{
            console.log("Token Data", tokenData);
            if(!err && data){
                let userPhone = tokenData.phone;

                // Lookup the user Data
                _data.read ('users', userPhone, (err, userData)=> {
                    if(!err && userData){
                        let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                         // Verify that the user has less than the number of max-checks-per-user
                         if(userChecks.length < config.maxChecks){
                            // Crate a random id for the check 
                            let checkId = helpers.createRandomString(20);

                            // Create the check object and include the user's phone
                            let checkObject = {
                                'id' : checkId,
                                'userPhone' : userPhone,
                                'protocal' : protocal,
                                'url' : url,
                                'method' : method,
                                'successCodes' : successCodes,
                                'timeoutSeconds' : timeoutSeconds
                            }

                            // Save the object
                            _data.create('checks', checkId, checkObject, (err)=>{
                                if(!err){
                                    // Add the check id to the user's object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    // Save the new user data
                                    _data.update('users', userPhone, userData, (err)=>{
                                        if(!err){
                                            // Return the data about the new check
                                            callback(200, checkObject);
                                        }else{
                                            callback(500, {'Error': "Could not update the user with the new check"});
                                        }
                                    })
                                }else {
                                    callback(500, {'Error' : 'Could not create the new check'});
                                }
                            })
                         }else {
                             callback(400, {'Error': 'The user already has the maximum number of checks ('+config.maxChecks+')'})
                         }
                    }else {
                        callback(403);
                    }
                })
            }else {
                callback(403)
            }
        })
    }else {
        callback(400, {'Error' : "Missing required inputers, or inputs are invalid"});
    }
}

// Checks - get
// Required data: id
// Optional Data: none
// @ToDo Only let an authenticated user acces their object. Dont let them access anyones object.
handlers._checks.get = (data, callback) => {
    // Check that the id is valid
    let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : null;
    if(id){
        // Lookup the check
        console.log("id presents");
        _data.read('checks', id, (err, checkData)=>{
            console.log("checkData", checkData);
            if(!err && checkData){
                // Get the token from the headers
                let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                // Verify that the given token is valid belongs to the user who created the check
                handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                    if(tokenIsValid){
                        //Return the check data
                        callback(200, checkData);
                    }else {
                        callback(403);
                    }
                })
            }else {
                callback(404);
            }
        })
        
    }else{
        callback(400, {'Error': 'Missing required field'});
    }
}

// Checks - put
// Required data : id
// Optional data : protocal, url, method, successCodes, timeoutSeconds (one must be set)
handlers._checks.put = (data, callback) => {
    // Check for the required field
    let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    // Check for the optional fields
    let protocal = typeof(data.payload.protocal) == 'string' && ['https', 'http'].indexOf(data.payload.protocal) > -1 ? data.payload.protocal : false;
    let url = typeof(data.payload.url) == 'string'&& data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    let method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    let successCodes = typeof(data.payload.successCodes) == 'object'&& data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0  ? data.payload.successCodes: false;
    let timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number'&& data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <=5 ?data.payload.timeoutSeconds : false;

    // Check to make sure id is valid
    if(id){
        // Check to make sure one or more optional fields has been sent
        if(protocal || url || method || successCodes || timeoutSeconds){
            //Lookup the check
            _data.read('checks', id, (err, checkData)=> {
                if(!err && checkData){
                    // Get the token from the headers
                    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                    // Verify that the given token is valid belongs to the user who created the check
                    handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                        if(tokenIsValid){
                            // Update the check where necessary
                            if(protocal){
                                checkData.protocal = protocal;
                            }
                            if(url){
                                checkData.url = url;
                            }
                            if(method){
                                checkData.method = method;
                            }
                            if(successCodes){
                                checkData.successCodes = successCodes;
                            }
                            if(timeoutSeconds){
                                checkData.timeoutSeconds = timeoutSeconds;
                            }

                            // Store the updates
                            _data.update('checks', id, checkData, (err)=>{
                                if(!err){
                                    callback(200);
                                }else {
                                    callback(400, {'Error': "Couldn\'t update the checks"});
                                }
                            })
                        }else {
                            callback(403);
                        }
                    })
                }else {
                    callback(400, {'Error': "Check Id didn\'t exist"});
                }
            })
        }else {
            callback(400, {'Error': "Missing fields to update"});
        }
    }else {
        callback(400, {'Error': "Missing required field"});
    }

}

// Checks - delete
// Required data - id
// Optional data - none
handlers._checks.delete = (data, callback) => {
    // Check that the id is valid
    let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : null;
    
    // Lookup the check
    _data.read('checks', id, (err, checkData)=>{
        if(!err && checkData){
            // Get the token from the headers
            let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            // Verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                if(tokenIsValid){ 
                    // Delete the check data
                    _data.delete('checks', id, (err)=>{
                        if(!err){
                            //Looking the user
                            _data.read('users', checkData.userPhone, (err, userData)=>{
                                if(!err && userData){
                                    let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                                    // Remove the delete check from their list of checks
                                    let checkPosition = userChecks.indexOf(id);
                                    if(checkPosition > -1){
                                        userChecks.splice(checkPosition, 1);
                                        //Re-save the user's data
                                        _data.update('users', checkData.userPhone, userData, (err)=>{
                                            if(!err){
                                                callback(200);
                                            }else {
                                                callback(500, {'Error': 'Couldn\'t update the user'})
                                            }
                                        })
                                    }
                         
                                }else {
                                    callback(500, {'Error': 'Couldn\'t find the user who created the check, so couldn\'t remove the check from the list of checks on the user object'})
                                }
                            });
                        }else {
                            callback(500, {'Error': 'Couldn\'t delete the check data'})
                        }
                    });
                }else {
                    callback(403, {'Error' : "Missing the reuqired token in header, or token is expired"});
                }
            })
        }else {
            callback(400, {'Error': "The specified check ID does not exist"});
        }
    })

    
}

// ping route handler
handlers.ping = (data, callback)=>{
    // Callback a http status code and a payload object
    callback(200);
}
// Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}


// Export the module
module.exports = handlers;