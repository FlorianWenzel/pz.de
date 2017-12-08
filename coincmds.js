var request = require('request')
const pwGen = require('password-generator');

module.exports = {
  knowUser: function(users, username){
    if(!users.findOne({name:username})){
      users.insert({
        name: username,
        password: pwGen(30, false),
        loggedIntoWebsite: 0,
        coins: 0,
        onionsWatered: 0,
        messagesSent: 0,
        notifications: [],
        gambleNet: 0,
        coinsCollected: 0,
        taler: 0
      });
    }
    return;
  },
  rewardCoins: function(channel, users, twitchID, io){
    request({
        url: 'https://api.twitch.tv/kraken/streams/'+channel+'?client_id=' + twitchID,
        json: true
    }, function (error, response, body) {
      if(!error && body.stream != null){
        request({
            url: "https://tmi.twitch.tv/group/user/"+channel+"/chatters",
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                viewer = new Array;
                for(i = 0; i < body.chatters.moderators.length; i++){
                  viewer.push(body.chatters.moderators[i])
                }
                for(i = 0; i < body.chatters.viewers.length; i++){
                  viewer.push(body.chatters.viewers[i])
                }
                for(i = 0; i < body.chatters.global_mods.length; i++){
                  viewer.push(body.chatters.global_mods[i])
                }
                for(i = 0; i < body.chatters.admins.length; i++){
                  viewer.push(body.chatters.admins[i])
                }
                for(i = 0; i < body.chatters.staff.length; i++){
                  viewer.push(body.chatters.staff[i])
                }
                for(i = 0; i <viewer.length; i++){
                  user = users.findOne({ name:viewer[i]});
                  if(user){
                    user.coins ++;
                    user.coinsCollected ++;
                    io.to(user.name).emit('updateCoins', user.coins)
                }
              }
            }
          })
      }
    })
  },
  viewCoins: function (type, client, users, channel, userstate, log) {
    if(users.findOne({ name:userstate.username})){
      say(client, type, channel, userstate.username + ' besitzt ' + users.findOne({ name:userstate.username}).coins.toString() + ' ZwiebelCoins!')
    }
  },
  setCoins: function (type, client, users, channel, userstate, message, io, log) {
    msg = message.split(" ")
    if(msg.length != 3 || msg[0] != "!setcoins" || isNaN(msg[2]) || parseInt(msg[2])<=0){
      say(client, type, channel, 'Benutz !setcoins <User> <Wie viel>')
    }else {
      user = users.findOne({ name:msg[1].toLowerCase()});
      if(user){
        user.coins = parseInt(msg[2]);
        say(client, type, channel, msg[1] + ' hat '+msg[2]+' nun ZwiebelCoins.')
        log.addLog(logs, userstate.username, msg[1], 'ZwiebelCoins', parseInt(msg[2]), 'setCoins')
        io.to(user.name).emit('updateCoins', user.coins)
        io.to(user.name).emit('showNotification', 'info', '<div class="field is-grouped is-grouped-multiline">' + getUserTag('warning', 'mod', 'dark', userstate.username) + 'hat deine ZwiebelCoins auf ' + msg[2] + ' gesetzt!</div>');
      }else{
          say(client, type, channel, 'Ich kenne keinen ' + msg[1]+ '.')
          return;
      }
    }
  },
  setTaler: function (type, client, users, channel, userstate, message, io, log) {
    msg = message.split(" ")
    if(msg.length != 3 || msg[0] != "!settaler" || isNaN(msg[2]) || parseInt(msg[2])<=0){
      say(client, type, channel, 'Benutz !settaler <User> <Wie viel>')
    }else {
      user = users.findOne({ name:msg[1].toLowerCase()});
      if(user){
        user.taler = parseInt(msg[2]);
        say(client, type, channel, msg[1] + ' hat '+msg[2]+' nun ZwiebelTaler.')
        log.addLog(logs, userstate.username, msg[1], 'ZwiebelTaler', parseInt(msg[2]), 'setTaler')
        io.to(user.name).emit('updateTaler', user.taler)
        io.to(user.name).emit('showNotification', 'info', '<div class="field is-grouped is-grouped-multiline">' + getUserTag('warning', 'mod', 'dark', userstate.username) + 'hat deine ZwiebelTaler auf ' + msg[2] + ' gesetzt!</div>');
      }else{
          say(client, type, channel, 'Ich kenne keinen ' + msg[1]+ '.')
          return;
      }
    }
  },
  giveTaler: function (type, client, users, channel, userstate, message, io, log) {
    msg = message.split(" ")
    if(msg.length != 3 || msg[0] != "!givetaler" || isNaN(msg[2])){
      say(client, type, channel, 'Benutz !givetaler <User> <Wie viel>')
    }else {
      user = users.findOne({ name:msg[1].toLowerCase()});
      if(user){
        user.taler += parseInt(msg[2]);
        say(client, type, channel, msg[1] + ' hat '+msg[2]+' ZwiebelTaler erhalten!')
        log.addLog(logs, userstate.username, msg[1], 'ZwiebelTaler', parseInt(msg[2]), 'giveTaler')
        io.to(user.name).emit('updateTaler', user.taler)
        io.to(user.name).emit('showNotification', 'success', '<div class="field is-grouped is-grouped-multiline">' + getUserTag('warning', 'mod', 'dark', userstate.username) + 'hat dir ' + msg[2] + ' ZwiebelTaler gutgeschrieben!</div>');
      }else{
          say(client, type, channel, 'Ich kenne keinen ' + msg[1]+ '.')
          return;
      }
    }
  },
  giveCoins: function (type, client, users, channel, userstate, message, io, log) {
    msg = message.split(" ")
    if(msg.length != 3 || msg[0] != "!givecoins" || isNaN(msg[2])){
      say(client, type, channel, 'Benutz !givecoins <User> <Wie viel>')
    }else {
      user = users.findOne({ name:msg[1].toLowerCase()});
      if(user){
        user.coins += parseInt(msg[2]);
        say(client, type, channel, msg[1] + ' hat '+msg[2]+' ZwiebelCoins erhalten!')
        log.addLog(logs, userstate.username, msg[1], 'ZwiebelCoins', parseInt(msg[2]), 'giveCoins')
        io.to(user.name).emit('updateCoins', user.coins)
        io.to(user.name).emit('showNotification', 'success', '<div class="field is-grouped is-grouped-multiline">' + getUserTag('warning', 'mod', 'dark', userstate.username) + 'hat dir ' + msg[2] + ' ZwiebelCoins gutgeschrieben!</div>');
      }else{
          say(client, type, channel, 'Ich kenne keinen ' + msg[1]+ '.')
          return;
      }
    }
  },
  giessen: function (client, io, username, message, misc, users, channel) {
    msg = message.split(" ");
    if(isNaN(msg[1]) || msg.length != 2 || parseInt(msg[1]) < 1){
      say(client, 'twitchChat', channel, 'Syntaxfehler :(')
      return;
    }
    if(users.findOne({name:username}).coins < parseInt(msg[1])){
      say(client, 'twitchChat', channel, 'Du hast zu wenig Zwiebelcoins.')
      return;
    }else{
      users.findOne({name:username}).coins -= parseInt(msg[1])
      if(users.findOne({name:username}).onionsWatered){
        users.findOne({name:username}).onionsWatered += parseInt(msg[1])
      }else{
        users.findOne({name:username}).onionsWatered = parseInt(msg[1])
      }
    }
    misc.findOne({id:'zwiebelbeetCounter'}).value += parseInt(msg[1])
    say(client, 'twitchChat', channel, username + ' hat ' + msg[1] + " Zwiebeln gegossen (jetzt:" +misc.findOne({id:'zwiebelbeetCounter'}).value % 10000  + '/10000)')
    io.sockets.emit('increaseOnions', (misc.findOne({id:'zwiebelbeetCounter'}).value % 10000), parseInt(msg[1]), username);
  }
  };

  function say(client, type, channel, msg){
    switch (type) {
      case 'whisper':
        client.whisper(channel, msg);
        break;
      case 'twitchChat':
        client.say(channel, msg);
        break;
    }
  }

  function getUserTag(typePrefix, prefix, typeSuffix, suffix) {
    return '<div style="padding-right: 4px;" class="control"><div class="tags has-addons"><span class="tag is-'+typePrefix+'">'+prefix+'</span><span class="tag is-'+typeSuffix+'">'+suffix+'</span></div></div>'
  }
