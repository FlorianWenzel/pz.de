module.exports = {
  on: function(admincmds, broadcast, commands, broadcasts, msgCounter, account, casino, coincmds, client, users, io, log, misc, beetIo, channel, userstate, message, self){
    if(self || userstate.username  ==  account.nick){
      return;
    }
    msgCounter.count ++;

    coincmds.knowUser(users, userstate.username)
    if(users.findOne({name:userstate.username}).messagesSent){
      users.findOne({name:userstate.username}).messagesSent ++;
    }else{
      users.findOne({name:userstate.username}).messagesSent = 1;
    }

    //MOD FUNCTIONS
    if(userstate.mod || userstate.username == account.channel){
      if (message.includes('!addcmd')){
        admincmds.addcmd('twitch', client, commands, channel, message);
        return;
      }else if(message.includes('!editcmd')){
        admincmds.editcmd('twitch', client, commands, channel, message);
        return;
      }else if(message.includes('!delcmd')){
        admincmds.delcmd('twitch', client, commands, channel, message);
        return;
      }else if(message.includes('!hidediscord')){
        admincmds.hidediscord('twitch', client, commands, channel, message);
        return;
      }else if(message.includes('!hidetwitch')){
        admincmds.hidetwitch('twitch', client, commands, channel, message);
        return;
      }else if(message.toLowerCase().includes('!addbrd')){
        broadcast.addbrd('twitch', client, broadcasts, channel, message);
        return;
      }else if(message.toLowerCase().includes('delbrd')){
        broadcast.delbrd('twitch', client, broadcasts, channel, message);
        return;
      }else if(message.toLowerCase().includes('listbrd')){
        broadcast.listbrd('twitch', client, broadcasts, channel);
        return;
      }else if(message.toLowerCase().includes('pausebrd') && !message.toLowerCase().includes('unpause')){
        broadcast.pausebrd('twitch', client, broadcasts, channel, message);
        return;
      }else if(message.toLowerCase().includes('unpausebrd')){
        broadcast.unpausebrd('twitch', client, broadcasts, channel, message);
        return;
      }else if(message.includes('!caster')){
        msg = message.split(' ')
        if(msg.length != 2)
          return;
        client.say(channel, 'Lasst ' + msg[1] + ' auch ein Zwiebelfollow da! Super Streamer! ' + msg[1] +' und die Zwiebel danken Dir! https://twitch.tv/' + msg[1])
      }
    }

    if(message.includes("!coins") || message.includes("!chips") || message == "!c"){
      coincmds.viewCoins('twitchChat', client, users, channel, userstate);
    }else if(message.includes('!setcoins') && (admins.includes(userstate.username) || '#' + userstate.username == channel)){
      coincmds.setCoins('twitchChat', client, users, channel, userstate, message, io, log);
    }else if(message.includes('!settaler') && (admins.includes(userstate.username) || '#' + userstate.username == channel)){
      coincmds.setTaler('twitchChat', client, users, channel, userstate, message, io, log);
    }else if(message.includes('!givetaler') && (admins.includes(userstate.username) || '#' + userstate.username == channel)){
      coincmds.giveTaler('twitchChat', client, users, channel, userstate, message, io, log);
    }else if(message.includes('!givecoins') && (admins.includes(userstate.username) || '#' + userstate.username == channel)){
      coincmds.giveCoins('twitchChat', client, users, channel, userstate, message, io, log);
    }else if(message.includes('!bohlen') && (admins.includes(userstate.username) || '#' + userstate.username == channel)){
        msg = message.split(' ')
        if(!(msg.length != 2 || isNaN(msg[1]))){
          beetIo.emit('bohlen', msg[1])
        }
    }else if(message.includes('!reif') && (admins.includes(userstate.username) || '#' + userstate.username == channel)){
        msg = message.split(' ')
        if(!(msg.length != 2 || isNaN(msg[1]))){
          beetIo.emit('reif', msg[1])
        }
    }else if(message.includes("!gamble")){
      casino.gamble(client, users, channel, userstate, message, io);
    }else if(message.includes('!slots ') || message.includes('!slot ') || message.includes('!s ')){
      casino.slots(client, users, channel, userstate, message, io);
    }else if(message.includes('!gießen') || message.includes('!giessen') || message.includes('!giesen')){
      coincmds.giessen(client, beetIo,  userstate.username, message, misc, users, channel)
    }else if (message.includes('!sunshine')) {
      beetIo.emit('sunshine');
    }
    if(message.toLowerCase() ==  '!commands'){
      var cmds = commands.where(function(obj) {
        if(!obj.hidetwitch)
          return true;
        return false;
      });
      msg = ''
      for(i=0;i<cmds.length;i++){
        msg += cmds[i].command
        if(i != cmds.length -1){
          msg += ', '
        }
      }
      client.say(channel, msg)
    }

    msg = message.split(" ")
    if(msg.length == 1 && commands.findOne({ command:msg[0].toLowerCase()})){
      client.say(channel, commands.findOne({ command:msg[0].toLowerCase()}).response)
    }
  }
}
