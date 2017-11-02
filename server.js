const express = require('express'),
      socketio = require('socket.io'),
      app = express(),
      http = require('http'),
      loki = require('lokijs'),
      cookie = require('js-cookie'),
      https = require('https');

server = http.createServer(app)
app.use(express.static(__dirname + '/client'));


app.get('*', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
var io = socketio(server);
server.listen(80);
io.on('connection', function (socket) {
  console.log(socket.handshake.address + 'just connected')
  socket.on('addToWhitelist', function(username){
  })
});
