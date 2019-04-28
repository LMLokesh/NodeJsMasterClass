// Dependencies
var fs = require('fs');

// App object
var jokes = {};

// Get all the jokes and return them to the user
jokes.allJokes = () =>{
    // Read the text file containing the jokes
    let fileContents = fs.readFileSync(__dirname + '/jokes.txt', 'utf-8');

    // Turn the string into an array
    let arrayOfJokes = fileContents.split(/\r?\n/);

    // Return the array
    return arrayOfJokes;
}

// Export the library
module.exports = jokes;

