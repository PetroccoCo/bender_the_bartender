'use strcit';

console.log('1');
// Connect to server
var io = require('socket.io-client');
var socket = io.connect('https://ec2-52-201-222-163.compute-1.amazonaws.com', {reconnect: true});
var q = require('q');

var drinksMenu = [
  "gin",
  "gin and tonic",
  "gin martini",
  "vodka",
  "vodka martini",
  "vodka tonic"
];

var _pouring = false;

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
  if (_pouring) {
    socket.emit('benderResponse', 'pouring');
    return;
  }

  if( drinksMenu.indexOf(drink.toLowerCase()) >= 0) {
    _pouring = true;
    socket.emit('benderResponse', 'okay');
    pourDrink(drink)
      .then(function(response) {
        _pouring = false;
      });
  }
  else {
    socket.emit('benderResponse', 'error');
  }
});

setTimeout(function() {
    console.log("emitting message");
    socket.send('client message sent');
  }, 1500);

function pourDrink(drink) {
  var defer = q.defer();

  setTimeout(function() {
    console.log("Okay done pouring");
    defer.resolve('okay');
  }, 15000);

  return defer.promise;
}

