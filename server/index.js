'use strict';

// Load requirements
var http = require('http'),
io = require('socket.io');

// Create server & socket
var server = http.createServer(function(req, res)
{
  // Send HTML headers and message
  res.writeHead(404, {'Content-Type': 'text/html'});
  res.end('<h1>Aw, snap! 404</h1>');
});
server.listen(8080);
console.log("Listening on 8080");
io = io.listen(server);

// Add a connect listener
io.sockets.on('connection', function(socket)
{
  console.log('Client connected.');

  socket.on('message', function(message) {
    console.log("Message Recieved", message);
  });

  // Disconnect listener
  socket.on('disconnect', function() {
  console.log('Client disconnected.');
  });
});
