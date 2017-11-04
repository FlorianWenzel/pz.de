const express = require('express');
const socketio = require('socket.io');
const app = express();
const http = require('http');
const loki = require('lokijs');
const cookie = require('js-cookie');
const tmi = require('tmi.js');
const https = require('https');
const account = require('./account.js');
const coincmds = require('./coincmds.js');
const casino = require('./gamble.js');
const channel = 'dukexentis';
const pwgen = require('password-generator');

var options = {
  options: {
    debug: false
  },
  connection: {
    reconnect: true,
    port: 80
  },
  identity: {
    username: account.nick,
    password: account.pw
  },
  channels: [channel]
}

var timer = 0;
setInterval(interval, (1000))
function interval() {
  if(timer % 60 == 0){
    coincmds.giveCoins(channel, users, account.twitchID, io)
  }
  db.saveDatabase();
  timer++;
}

var db = new loki('./database.json',
      {
        autoload: true,
        autoloadCallback : loadHandler,
        autosave: true,
        autosaveInterval: 1000
      });

function loadHandler() {
    users = db.getCollection('users');
    if (!users) {
        users = db.addCollection('users');
    }
}

var client = new tmi.client(options);
client.connect();

server = http.createServer(app)
app.use(express.static(__dirname + '/client'));


app.get('*', function(req, res){
  res.sendFile(__dirname + '/client/html/index.html');
});
var io = socketio(server);
server.listen(80);
io.on('connection', function (socket) {
  console.log(socket.handshake.address + 'just connected')
  socket.on('login', function(username, password){
    user = users.findOne({name:username.toLowerCase()})
    if(!user){
      socket.emit('loginUnsuccessful');
      return;
    }
    if(user.password != password){
      socket.emit('loginUnsuccessful');
      return;
    }
    user.loggedIntoWebsite ++;
    socket.join(username.toLowerCase())
    socket.emit('loginSuccessfull', user);
  })
});





//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////TWITCH////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

client.on("whisper", function (from, userstate, message, self) {
  if(message.toLowerCase() == '!register' || message.toLowerCase() == '!password' || message.toLowerCase() == '!passwort'){
    coincmds.knowUser(users, userstate.username)
    client.whisper( from, 'Hi! Dein Benutzername ist: ' + userstate.username + ' und dein Passwort: ' + users.findOne({name:userstate.username}).password)
  }
})
client.on("chat", function(channel, userstate, message, self){
  if(self){
    return;
  }
  coincmds.knowUser(users, userstate.username)
  //COINS FUNCTIONS
  //VIEW COINS
  if(message.includes("!coins") || message.includes("!chips") || message == "!c"){
    coincmds.viewCoins(client, users, channel, userstate);
  }else if(message.includes('!setcoins') && (userstate.mod || '#' + userstate.username == channel)){
    coincmds.setCoins(client, users, channel, userstate, message, io);
  //GAMBLE
  }else if(message.includes("!gamble")){
    casino.gamble(client, users, channel, userstate, message, io);
  }else if(message.includes('!slots ') || message.includes('!slot ') || message.includes('!s ')){
    casino.slots(client, users, channel, userstate, message, io);
  }
})
