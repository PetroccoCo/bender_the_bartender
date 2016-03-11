// Start up the server
var express = require('express');
var alexa = require('alexa-app');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.port || 8080;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine','ejs');

var alexaApp = new alexa.app('test');
alexaApp.launch(function(request,response) {
	response.say("You launched the app!");
});
alexaApp.dictionary = {"names":["matt","joe","bob","bill","mary","jane","dawn"]};
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
alexaApp.express(app, "/echo/");

// Launch /echo/test in your browser with a GET request!

if( process.env.ssl == 'enabled' ) {
  var https = require('https');
  var fs = require('fs');
  var privateKey  = fs.readFileSync('../ssl_certs/private-key.pem', 'utf8');
  var certificate = fs.readFileSync('../ssl_certs/certificate.pem', 'utf8');

  var credentials = {key: privateKey, cert: certificate};

  var httpsServer = https.createServer(app)

  httpsServer.listen(443);
  console.log("Listneing on https 443");
}

app.listen(PORT);
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
