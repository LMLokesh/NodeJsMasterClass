var mathLib = require('./lib/math')
var jokesLib = require('./lib/jokes')

//App object
var app = {}

// Configuration
app.config = {
    'timeBetweenJokes': 1000
}

// Function that prints a random joke
app.printAJoke = ()=>{
    // Get all the Jokes
    let allJokes = jokesLib.allJokes();
    // get the length of the jokes
    let numberOfJokes = allJokes.length;

    // Pick a random number between 1 and the number of jokes
    let randomNumber = mathLib.getRandomNumber(1, numberOfJokes);

    // Get the Joke at that position in the array  (minus one)
    let selectedJoke = allJokes[randomNumber  - 1 ];

    // Send the joke to the console
    console.log(selectedJoke);
}

// Get the random joke with infenity loop
setInterval(app.printAJoke,app.config.timeBetweenJokes);
