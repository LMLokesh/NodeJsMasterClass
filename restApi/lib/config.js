/*
* Create and export confguration variables
*
*/


// Container for all the environments
var environments = {};

// Staging (default) environment
environments.staging = {
 'httpPort' : 3000,
 'httpsPort' : 3001,
 'envName' : 'staging',
 'hasingSecret' : 'thisIsASecret', 
 'maxChecks' : 5,
 'twilio' : {
    'accountSid' : 'AC1e1bb30847c5cb56bf690e0dae3ba9f6',
    'authToken' : '56c27c17cace51bbd39d7fe159208e7b',
    'fromPhone' : '+14843020821'
}
}

// Production environment
environments.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production',
    'hasingSecret' : 'thisIsASecret', 
    'maxChecks' : 5,
    'twilio' : {
        'accountSid' : 'AC1e1bb30847c5cb56bf690e0dae3ba9f6',
        'authToken' : '56c27c17cace51bbd39d7fe159208e7b',
        'fromPhone' : '+14843020821'
    }
}

// cmd example for passing process environments in cmd line
// NODE_ENV=staging node index.js

// Determine which enviromnet was passed as a command-line argument
let currentEnvironmnet = process.env.NODE_ENV && typeof(process.env.NODE_ENV == 'string') ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current enviromnet is one of the enviromnets above, if not, default to staging
let enviromnetToExport = typeof(environments[currentEnvironmnet]) == 'object' ? environments[currentEnvironmnet] : environments.staging;

// Export the Module
module.exports = enviromnetToExport;