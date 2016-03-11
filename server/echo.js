// Start up the server
var http = require('http');
var io = require('socket.io');
var express = require('express');
var alexa = require('alexa-app');
var bodyParser = require('body-parser');

var _socket;

var app = express();
var PORT = process.env.port || 8080;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine','ejs');

var drinksMenu = [
  "Gin",
  "Gin and Tonic",
  "Gin Martini",
  "Vodka",
  "Vodka Martini",
  "Vodka Tonic"
];

var alexaApp = new alexa.app('bender');
alexaApp.launch(function(request,response) {
	response.say("Waiting to take your order and BE QUICK with it!!");
});
alexaApp.dictionary = {"names":["matt","joe","bob","bill","mary","jane","dawn"], "drinks" : drinksMenu};
alexaApp.intent("nameIntent",
	{
		"slots":{"NAME":"LITERAL"}
		,"utterances": [
			"my {name is|name's} {names|NAME}"
			,"set my name to {names|NAME}"
		]
	},
	function(request,response) {
		response.say("Success!");
	}
);

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
    _socket.send("Pour", drink);
		response.say("Okay, I'll make you a " + drink);
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

/*
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

// your express configuration here

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(80);
httpsServer.listen(443);
*/
