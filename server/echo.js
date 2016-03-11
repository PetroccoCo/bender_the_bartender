// Start up the server
var http = require('http');
var io = require('socket.io');
var express = require('express');
var alexa = require('alexa-app');
var bodyParser = require('body-parser');
var q = require('q');

var _defer = q.defer();
var _socket;

var app = express();
var PORT = process.env.port || 8080;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine','ejs');

var drinksMenu = [
  "gin",
  "gin and tonic",
  "gin martini",
  "vodka",
  "vodka martini",
  "vodka tonic"
];

var alexaApp = new alexa.app('bender');
alexaApp.launch(function(request,response) {
	response.say("Waiting to take your order and BE QUICK with it!!");
});
alexaApp.dictionary = {"drinks" : drinksMenu};

alexaApp.intent("drinkIntent",
	{
		"slots":{"DRINK":"LITERAL"}
		,"utterances": [
			"make me a {drinks|DRINK}",
      "pour me a {drinks|DRINK}"
		]
	},
	function(request,response) {
    var drink = request.slot('DRINK');
    console.log("Drink is", drink, drinksMenu.indexOf(drink.toLowerCase()));

    if( _socket === undefined || _socket.conn.disconnected) {
      response.say("Sorry there is no Bender to get your drink");
      return;
    }

    if (_defer.promise.inspect().state === 'pending') {
      response.say("Sorry, Bender is busy taking another order");
      return;
    }

    if( drinksMenu.indexOf(drink.toLowerCase()) >= 0 ) {
      // TODO this should be an async call and let the client be the end all be all of state.
      // send the drink request to the client and let it responsd with:
      //  Success
      //  Pooring
      //  Error
      drinkOrderMessageHandler(drink)
        .then(function domhSuccess(message) {
            response.say("Okay, I'll make you a " + drink);
          },
          function domhError(error) {
            switch(error) {
              case 'pouring':
                message = "Hold your bits, Bender is pouring a drink";
                break;
              case 'error':
                message = "Shit! Something broke";
                break;
            }
            response.say(message);
          }
        );
    }
    else {
      response.say("Sorry, I don't know how to make a " + drink);
    }
	}
);
alexaApp.express(app, "/echo/", true);

// Launch /echo/test in your browser with a GET request!

if( process.env.ssl == 'enabled' ) {
  var https = require('https');
  var fs = require('fs');
//  var privateKey  = fs.readFileSync('../ssl_certs/private-key.pem', 'utf8');
//  var certificate = fs.readFileSync('../ssl_certs/certificate.pem', 'utf8');
  var privateKey  = fs.readFileSync('../ssl_certs/private-key.pem', 'utf8');
  var certificate = fs.readFileSync('../ssl_certs/certificate.pem', 'utf8');

  var credentials = {key: privateKey, cert: certificate};

  var httpsServer = https.createServer(credentials, app);

  httpsServer.listen(443);
  console.log("Listneing on https 443");

  // Socket Listener
  io = io.listen(httpsServer);

  // Add a connect listener
  io.sockets.on('connection', function(socket)
  {
    _socket = socket;
    console.log('Client connected.');

    _socket.on('message', function(message) {
      console.log("Message Recieved", message);
    });

    // Disconnect listener
    _socket.on('disconnect', function() {
      console.log('Client disconnected.');
    });
  });
}

var httpServer = http.createServer(app);
httpServer.listen(PORT);
console.log("Listening on port "+PORT);

function drinkOrderMessageHandler(drink) {
  _socket.emit('drinkOrder', drink);

  _socket.on('benderResponse', function benderResponseHandler(reponse) {
    _socket.off('benderResponse');
    if(reponse == 'success')
      _defer.resolve(response);
    else
      _defer.reject(response);
  });

  return _defer.promise.timeout( 3000, "error" );
}
