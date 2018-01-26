module.exports = {
  on: function(msgCounter, account, casino, coincmds, client, users, io, log, misc, beetIo, channel, userstate, message, self, admins){
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
  }
}
