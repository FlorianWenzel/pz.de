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
const stats = require('./stats.js');
const shop = require('./shop.js');
const twitchchat = require('./twitchchat');
const streamlab = require('./streamlabs.js');
const whisper = require('./whisper.js');
const casino = require('./gamble.js');
const channel = account.channel;
const pwgen = require('password-generator');
const request = require('request');
const io_client = require('socket.io-client');
const streamlabs = io_client(`https://sockets.streamlabs.com?token=` + account.streamlabsToken);
const log = require('./log.js');
const admins = ['dukexentis', 'onlyamiga', 'pokerzwiebel', 'sunshine_deluxe'];
const nodemailer = require('nodemailer');

var client = new tmi.client({
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
});
client.connect();

var timer = 0;
setInterval(interval, (1000))
function interval() {
  if(timer % 60 == 0){
    coincmds.rewardCoins(channel, users, account.twitchID, io)
  }
  if(timer % 33 == 0){
    stats.refreshStats(users, misc);
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
    streamlabsIDs = db.getCollection('streamlabsIDs');
    if(!streamlabsIDs){
      streamlabsIDs = db.addCollection('streamlabsIDs')
    }
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
    sessions = misc.findOne({id:'sessions'});
    if(!sessions){
      misc.insert({
        id:'sessions',
        data: []
      })
      sessions = misc.findOne({id:'sessions'});
    }
}

//+BEET+//
var beet = express();
var beetServer = http.createServer(beet);
var beetIo = socketio(beetServer);
beetIo.on('connection', function(sock){
  if(!misc.findOne({id:'zwiebelbeetCounter'})){
    misc.insert({
      id: 'zwiebelbeetCounter',
      value: 0
    });
    db.saveDatabase()
  }
  sock.emit('increaseOnions',(misc.findOne({id:'zwiebelbeetCounter'}).value % 10000), (misc.findOne({id:'zwiebelbeetCounter'}).value), 'Eine höhere Macht');

});
beet.use(express.static(__dirname + '/beet'));
beetServer.listen(8080, () => console.log('Zwiebelbeet listening on port 8080!'));
//-BEET-//

//+WEBSITE-EXPRESS+//
server = http.createServer(app)
app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/html/index.html');
});
app.get('*', function(req, res){
  res.sendFile(__dirname + '/client/html/index.html');
});
server.listen(3000, () => console.log('Zwiebelpage listening on port 3000!'));
//-WEBSITE-EXPRESS-//

//+WEBSITE-SOCKETIO+//
var io = socketio(server);
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
  socket.on('getGiessenStats', function(){
    socket.emit('getGiessenStats', misc.findOne({id:'totalWateredOnions'}).count, misc.findOne({id:'topGiesser'}).value)
  })
  socket.on('getGambleStats', function(){
    socket.emit('getGambleStats', misc.findOne({id:'gambleStats'}))
  })
  socket.on('getChatterStats', function(){
    socket.emit('getChatterStats', misc.findOne({id:'msgCounter'}).count, misc.findOne({id:'topChatter'}).value)
  })
  socket.on('getChallengeStats', function(){
    socket.emit('getChallengeStats', misc.findOne({id:'sessions'}).data)
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
    socket.emit('getLogs', r.slice(0,99), false, users.findOne({name:u, password:p}).gambleNet, users.findOne({name:u, password:p}).coinsCollected)
  })
  socket.on('getFilteredLogs', function(filter){
    filteredlogs = log.getFilteredLogs(logs, filter);
    socket.emit('getLogs', filteredlogs.slice(0, 99), true)
  })
  socket.on('getHomeStats', function(){
    socket.emit('getHomeStats', misc.findOne({id:'onions'}).count, misc.findOne({id:'seenMinutes'}).count, misc.findOne({id:'msgCounter'}).count)
  })
  socket.on('buy', function (u, p, product, street, plz, city, print, misc, vorname, name, zusatz, contactPerMail, contactPerTwitch, email) {
    shop.buy(users, nodemailer, log, socket, account, u, p, product, street, plz, city, print, misc, vorname, name, zusatz, contactPerMail, contactPerTwitch, email)
  });
});
//-WEBSITE-SOCKETIO-//

//+STREAMLABS+//
streamlabs.on('event', (eventData) => {
  streamlab.on(eventData, io, users, log)
});
//-STREAMLABS-//

//+TWITCH+//
client.on("whisper", function (from, userstate, message, self) {
  whisper.on(msgCounter, account, casino, coincmds, client, users, io, log, misc, beetIo, from, userstate, message, self)
})

client.on("chat", function(channel, userstate, message, self){
  twitchchat.on(msgCounter, account, casino, coincmds, client, users, io, log, misc, beetIo, channel, userstate, message, self)
})
//-TWITCH-//
