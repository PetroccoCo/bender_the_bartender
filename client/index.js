'use strcit';

console.log('1');
// Connect to server
var io = require('socket.io-client');
var socket = io.connect('http://localhost:8080', {reconnect: true});

console.log('2');

// Add a connect listener
socket.on('connect', function(socket) { 
  console.log('Connected!');
});

setTimeout(function() {
    console.log("emitting message");
    socket.send('client message sent');
  }, 1500);

console.log('3');
