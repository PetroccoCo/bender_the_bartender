'use strcit';

console.log('1');
// Connect to server
var io = require('socket.io-client');
var socket = io.connect('https://ec2-52-201-222-163.compute-1.amazonaws.com', {reconnect: true});
var q = require('q');
var _bartendroIp = process.env.ip || '192.168.55.77';

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
  var defer = q.defer(),
      http = require('http');

  var request = http.get('http://' + _bartendroIp + ':8080/ws/drink/2?booze1=75', function (response) {
    // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
          console.log("HTTP Client Data Received");
          body += d;
        });
        response.on('end', function() {
            console.log("http get end");
            defer.resolve('okay');
        });
  });

  request.setTimeout(60000, function() {
    console.log("Http Client Timeout Reached");
  });

  return defer.promise;
}

