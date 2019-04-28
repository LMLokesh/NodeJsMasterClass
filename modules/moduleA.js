const lib = {}

lib.foo = ()=> {
    console.log("console logging from moduleA");
}

// exporting module
module.exports = lib;