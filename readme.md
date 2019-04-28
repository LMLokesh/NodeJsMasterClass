Prerequisites: [
    'Javascript', 'terminal commands'
]

// cmd example for passing process environments in cmd line
 NODE_ENV=staging node index.js

// Key generation for HTTPS server options  => generating key.pem and cert.pem files
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem