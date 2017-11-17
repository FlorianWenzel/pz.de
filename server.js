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
const muetzePrice = 200;
const plueschPrice = 200;
const nodemailer = require('nodemailer');


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
  if(timer % 33){
    refreshStats();
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
    misc = db.getCollection('misc');
    if (!misc) {
      misc = db.addCollection('misc');
    }
    if (!users) {
        users = db.addCollection('users');
    }
    if (!logs) {
      logs = db.addCollection('logs');
    }

    msgCounter = misc.findOne({id:'msgCounter'});
    if(!msgCounter){
      misc.insert({
        id:'msgCounter',
        count:0
      })
      msgCounter = misc.findOne({id:'msgCounter'});
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
    socket.emit('loginSuccessful', user, isMod);
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
        user.loggedIntoWebsite ++;
        socket.join(username.toLowerCase())
        isMod = false;
        if(admins.includes(user.name)){isMod = true;}
        socket.emit('loginSuccessful', user, isMod);
      })
    })
    db.saveDatabase();
  })
  socket.on('convert',function(usr, pw){
    user = users.findOne({name:usr, password:pw})
    if(!user){return;}
    if(user.coins < 1000){return;}
    user.coins -= 1000;
    user.taler += 1;
    socket.emit('updateTaler', user.taler)
    socket.emit('updateCoins', user.coins)
    log.addLog(logs, user.name, user.name, 'ZwiebelCoins', -1000, 'Umgetauscht')
    log.addLog(logs, user.name, user.name, 'ZwiebelTaler', +1, 'Umgetauscht')
    socket.emit('showNotification', 'success', 'Erfolgreich 1000 ZwiebelCoins in 1 ZwiebelTaler umgetauscht!')
    db.saveDatabase();
  })
  socket.on('getAllLogs', function(u, p){
    if(!(users.findOne({name:u, password:p}))){return;}
    if(!(admins.includes(users.findOne({name:u, password:p}).name))){return;}
    socket.emit('getLogs', logs.where(function(){return true;}).slice(0, 99), true)
    db.saveDatabase();
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
  socket.on('getHomeStats', function(){
    socket.emit('getHomeStats', misc.findOne({id:'onions'}).count, misc.findOne({id:'seenMinutes'}).count, misc.findOne({id:'msgCounter'}).count)
  })
  socket.on('buy', function(u, p, product, street, plz, city, print, misc){
    user = users.findOne({name: u, password:p});
    if(!user){return;}
    switch (product) {
      case 'PlüschZwiebel':
          if(user.taler < plueschPrice){
            return;
          }else{
            change = -plueschPrice;
            user.taler -= plueschPrice;
          }
        break;
      case 'ZwiebelMütze':
          if(user.taler < muetzePrice){
            return;
          }else{
            change = -muetzePrice;
            user.taler -= muetzePrice;
          }
        break;
    }
    nodemailer.createTestAccount((err, acc) => {

      let transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
              user: 'pokerzwiebel@gmail.com',
              pass: account.password
          }
      });
      let mailOptions = {
          from: '<PokerZwiebel@gmail.com>',
          to: 'PokerZwiebel@gmail.com',
          subject: 'Bestellung ' + product + ' von ' + u,
          text: '<b>Neue Bestellung:</b> <br>' +
                'Benutzername: ' + u + ' <br>' +
                'Product: ' + product + '<br>' +
                'Straße: ' + street + ' <br>' +
                'PLZ: ' + plz + ' <br>' +
                'Stadt: ' + city + ' <br>' +
                'Aufdruck: ' + print + '<br>' +
                'Sonstiges: ' + misc +'<br>--------------',
          html: '<b>Neue Bestellung:</b> <br>' +
                'Benutzername: ' + u + ' <br>' +
                'Product: ' + product + '<br>' +
                'Straße: ' + street + ' <br>' +
                'PLZ: ' + plz + ' <br>' +
                'Stadt: ' + city + ' <br>' +
                'Aufdruck: ' + print + '<br>' +
                'Sonstiges: ' + misc +'<br>--------------'
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
      });
    });
    log.addLog(logs, user.name, user.name, 'ZwiebelTaler', change, 'Bestellung (' + product + ')')
    socket.emit('updateTaler', user.taler);
    socket.emit('updateCoins', user.coins);
    socket.emit('confirmPurchase', product);
  })
});


streamlabs.on('event', (eventData) => {
  if (!eventData.for && eventData.type === 'donation') {
    //code to handle donation events
    user = users.findOne({name: eventData.message[0].from.toLowerCase()});
    if(!user){
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
      return;
    }
    taler = Math.floor(parseInt(eventData.message[0].amount) / 10);
    user.taler += taler;
    if(taler > 0){
      io.to(user.name).emit('showNotification', 'success', '<strong>Vielen Dank</strong> für deine Bits ❤️ Dir wurden <strong>' + taler + ' ZwiebelTaler</strong> gutgeschrieben!');
      io.to(user.name).emit('updateTaler', user.taler);
    }
  }
  if (eventData.for === 'twitch_account') {
    switch(eventData.type) {
      case 'follow':
      io.to(user.name).emit('showNotification', 'success', '<strong>Vielen Dank</strong> für deinen Follow ❤️!');
        break;
      case 'subscription':
        user = users.findOne({name: eventData.message[0].name.toLowerCase()});
        if(!user){
          return;
        }
        switch (eventData.message[0].sub_plan) {
          case 1000:
            taler = 250;
            io.to(user.name).emit('showNotification', 'success', '<strong>Vielen Dank</strong> für deinen Sub ❤️ Dir wurden <strong>' + taler + ' ZwiebelTaler</strong> gutgeschrieben!');
            io.to(user.name).emit('updateTaler', user.taler);
            break;
          case 2000:
            taler = 500;
            io.to(user.name).emit('showNotification', 'success', '<strong>Vielen Dank</strong> für deinen Sub ❤️ Dir wurden <strong>' + taler + ' ZwiebelTaler</strong> gutgeschrieben!');
            io.to(user.name).emit('updateTaler', user.taler);
            break;
          case 3000:
            taler = 1250;
            io.to(user.name).emit('showNotification', 'success', '<strong>Vielen Dank</strong> für deinen Sub ❤️ Dir wurden <strong>' + taler + ' ZwiebelTaler</strong> gutgeschrieben!');
            io.to(user.name).emit('updateTaler', user.taler);
            break;
          default:
            taler = 250;
        }
        user.taler += taler
        break;
      default:
        //default case
    }
  }
  db.saveDatabase();
});

function refreshStats(){
  onions = misc.findOne({id:'onions'});
  if(!onions){
    misc.insert({
      id:'onions',
      count: 0
    })
    onions = misc.findOne({id:'onions'})
  }
  onions.count = users.where(function(){return true;}).length;

  seenMinutes = misc.findOne({id:'seenMinutes'});
  if(!seenMinutes){
    misc.insert({
      id:'seenMinutes',
      count: 0
    })
    seenMinutes = misc.findOne({id:'seenMinutes'})
  }
  usrs = users.where(function(){return true;});
  c = 0;
  for(i=0;i<usrs.lenght;i++){
    c += usrs[i].coinsCollected;
  }
  seenMinutes.count = c;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////TWITCH////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

client.on("whisper", function (from, userstate, message, self) {
  
})

client.on("chat", function(channel, userstate, message, self){
  if(self || userstate.username  ==  channel){
    return;
  }
  msgCounter.count ++;

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
