var request = require('request')
const pwGen = require('password-generator');

module.exports = {
  knowUser: function(users, username){
    if(!users.findOne({name:username})){
      users.insert({
        name: username,
        gambleCooldown: new Date().getTime() - 100000000,
        password: pwGen(12, false),
        loggedIntoWebsite: 0,
        coins: 0,
        taler: 0
      });
    }
    return;
  },
  giveCoins: function(channel, users, twitchID, io){
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
                    user.coins += 1
                    io.to(user.name).emit('updateCoins', user.coins)
                }
              }
            }
          })
      }
    })
  },
  viewCoins: function (client, users, channel, userstate) {
    if(users.findOne({ name:userstate.username})){
      client.say(channel, userstate.username + ' besitzt ' + users.findOne({ name:userstate.username}).coins.toString() + ' ZwiebelCoins!')
    }
  },
  setCoins: function (client, users, channel, userstate, message, io) {
    msg = message.split(" ")
    if(msg.length != 3 || msg[0] != "!setcoins" || isNaN(msg[2]) || parseInt(msg[2])<=0){
      client.say(channel, 'Benutz !setcoins <User> <Wie viel>')
    }else {
      user = users.findOne({ name:msg[1].toLowerCase()});
      if(user){
        user.coins = parseInt(msg[2]);
        client.say(channel, msg[1] + ' hat '+msg[2]+' nun ZwiebelCoins.')
        io.to(user.name).emit('updateCoins', user.coins)
      }else{
          client.say(channel, 'Ich kenne keinen ' + msg[1]+ '.')
          return;
      }
    }
  }

  };
