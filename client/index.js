'use strcit';

console.log('1');
// Connect to server
var io = require('socket.io-client');
var socket = io.connect('https://ec2-52-201-222-163.compute-1.amazonaws.com', {reconnect: true});

var drinksMenu = [
  "gin",
  "gin and tonic",
  "gin martini",
  "vodka",
  "vodka martini",
  "vodka tonic"
];

console.log('2');

// Add a connect listener
socket.on('connect', function(socket) { 
  console.log('Connected!');
});

socket.on('message', function(message) {
  console.log("Message received is: ", message);
  try {
    var drink = JSON.parse(message);
    console.log("DRINK", drink);
  }
  catch(ex) {
    console.log("Error Parsing Message", ex);
  }
});

socket.on('drinkOrder', function(drink) {
  console.log("Recieved drink order for " + drink);
});

setTimeout(function() {
    console.log("emitting message");
    socket.send('client message sent');
  }, 1500);

console.log('3');
