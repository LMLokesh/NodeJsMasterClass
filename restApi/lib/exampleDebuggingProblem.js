/*
* Library that demostrates something throwing when it's init() is called
*
*/

// Container for the module
let example = {};

// Init function
example.init = () =>{
    // this is an error created intentionally {bar is not defined}
    let foo = bar;
}

// Export the module
module.exports = example;