/*
 * Primary file for API (node --use_strict index-strict)
 *
 */

// Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli');

// Declare the app
var app = {};

// Declare a global (that strict mode should catch)
foo = 'bar';

// Init function
app.init = function(){

  // Start the server
  server.init();

  // Start the workers
  workers.init();

  // Start the CLI, but make sure it starts last
  setTimeout(()=>{
    cli.init();
  }, 50);

};

// Self executing
app.init();


// Export the app
module.exports = app;