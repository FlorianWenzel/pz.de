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
const channel = account.channel;
const pwgen = require('password-generator');
const request = require('request');
const io_client = require('socket.io-client');
const streamlabs = io_client(`https://sockets.streamlabs.com?token=` + account.streamlabsToken)
const log = require('./log.js');
const admins = ['dukexentis', 'onlyamiga', 'pokerzwiebel', 'sunshine_deluxe'];

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
    coincmds.rewardCoins(channel, users, account.twitchID, io)
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
    logs = db.getCollection('logs');
    if (!users) {
        users = db.addCollection('users');
    }
    if (!logs) {
      logs = db.addCollection('logs');
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
  socket.on('autoLogin', function(username, password){
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
    isMod = false;
    if(admins.includes(user.name)){isMod = true;}
    socket.emit('loginSuccessfull', user, isMod);
  })
  socket.on('auth', function (code){
    request.post({
        url: 'https://api.twitch.tv/kraken/oauth2/token?client_id='+account.twitchID+'&client_secret=' + account.twitchSecret + '&code=' + code + '&grant_type=authorization_code&redirect_uri=http://pokerzwiebel.de/login',
        json: true
    }, function (error, response, body) {
      if(!body.access_token){
        return;
      }
      request({
        url: 'https://api.twitch.tv/kraken?oauth_token=' + body.access_token,
        json: true
      }, function (error, response, body){
        if(!body.token.user_name){
          return;
        }
        username = body.token.user_name;
        user = users.findOne({name:username.toLowerCase()})
        if(!user){
          coincmds.knowUser(users, username);
          user = users.findOne({name:username.toLowerCase()})
        }
        console.log(user)
        user.loggedIntoWebsite ++;
        socket.join(username.toLowerCase())
        isMod = false;
        if(admins.includes(user.name)){isMod = true;}
        socket.emit('loginSuccessfull', user, isMod);
      })
    })
  })
  socket.on('convert',function(usr, pw){
    user = users.findOne({name:usr, password:pw})
    if(!user){return;}
    if(user.coins < 1000){return;}
    user.coins -= 1000;
    user.taler += 1;
    socket.emit('updateTaler', user.taler)
    socket.emit('updateCoins', user.coins)
    log.addLog(logs, user.name, user.name, 'coins', -1000, 'convert')
    log.addLog(logs, user.name, user.name, 'taler', +1, 'convert')
    socket.emit('showNotification', 'success', 'Erfolgreich 1000 ZwiebelCoins in 1 ZwiebelTaler umgetauscht!')
  })
  socket.on('getAllLogs', function(u, p){
    if(!(admins.includes(users.findOne({name:u, password:p}).name))){console.log('yo'); return;}
    socket.emit('getLogs', logs.where(function(){return true;}).slice(0, 99))
  })
  socket.on('getMyLogs', function(u, p){
    if(!(users.findOne({name:u, password:p}))){
      return;
    }
    r = log.getFilteredLogs(logs, {trigger_username:'',receiver_username:u,coins:true,taler:true})
    socket.emit('getLogs', r.slice(0,99))
  })
  socket.on('getFilteredLogs', function(filter){
    filteredlogs = log.getFilteredLogs(logs, filter);
    socket.emit('getLogs', filteredlogs.slice(0, 99), true)
  })
});


streamlabs.on('event', (eventData) => {
  console.log(eventData)
  if (!eventData.for && eventData.type === 'donation') {
    //code to handle donation events
    user = users.findOne({name: eventData.message[0].from.toLowerCase()});
    if(!user){
      console.log('user not found')
      return;
    }
    taler = Math.floor(10 * eventData.message[0].amount);
    user.taler += taler;
    if(taler > 0){
      io.to(user.name).emit('showNotification', 'success', '<strong>Vielen Dank</strong> für deine Donation ❤️ Dir wurden <strong>' + taler + ' ZwiebelTaler</strong> gutgeschrieben!');
      io.to(user.name).emit('updateTaler', user.taler);
    }
  }
  if(eventData.type === 'bits'){
    //code to handle bit events
    user = users.findOne({name: eventData.message[0].name.toLowerCase()});
    if(!user){
      console.log('user not found')
      return;
    }
    taler = Math.floor(parseInt(eventData.message[0].amount) / 10);
    user.taler += taler;
    if(taler > 0){
      io.to(user.name).emit('notificationDonation', taler);
      io.to(user.name).emit('updateTaler', user.taler);
    }
  }
  if (eventData.for === 'twitch_account') {
    switch(eventData.type) {
      case 'follow':
        //code to handle follow events
        break;
      case 'subscription':
        //code to handle subscription events
        user = users.findOne({name: eventData.message[0].name.toLowerCase()});
        if(!user){
          console.log('user not found')
          return;
        }
        /*
        user.taler += Math.floor(10 * eventData.message[0].amount);
        io.to(user.name).emit('notificationDonation', Math.floor(10 * eventData.message[0].amount));
        io.to(user.name).emit('updateTaler', user.taler);
        */
        break;
      default:
        //default case
    }
  }
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
  if(message.includes("!coins") || message.includes("!chips") || message == "!c"){
    coincmds.viewCoins(client, users, channel, userstate);
  }else if(message.includes('!setcoins') && (userstate.mod || '#' + userstate.username == channel)){
    coincmds.setCoins(client, users, channel, userstate, message, io, log);
  }else if(message.includes('!settaler') && (userstate.mod || '#' + userstate.username == channel)){
    coincmds.setTaler(client, users, channel, userstate, message, io, log);
  }else if(message.includes('!givetaler') && (userstate.mod || '#' + userstate.username == channel)){
    coincmds.giveTaler(client, users, channel, userstate, message, io, log);
  }else if(message.includes('!givecoins') && (userstate.mod || '#' + userstate.username == channel)){
    coincmds.giveCoins(client, users, channel, userstate, message, io, log);
  //GAMBLE
  }else if(message.includes("!gamble")){
    casino.gamble(client, users, channel, userstate, message, io);
  }else if(message.includes('!slots ') || message.includes('!slot ') || message.includes('!s ')){
    casino.slots(client, users, channel, userstate, message, io);
  }
})
