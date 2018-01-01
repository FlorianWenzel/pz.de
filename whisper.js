module.exports = {
  on: function(msgCounter, account, casino, coincmds, client, users, io, log, misc, beetIo, from, userstate, message, self, admins){
    if(message.includes("!coins") || message.includes("!chips") || message == "!c"){
      coincmds.viewCoins('whisper', client, users, userstate.username, userstate);
    }else if(message.includes('!setcoins') && admins.includes(userstate.username)){
      coincmds.setCoins('whisper', client, users, userstate.username, userstate, message, io, log, admins);
    }else if(message.includes('!settaler') && admins.includes(userstate.username) ){
      coincmds.setTaler('whisper', client, users, userstate.username, userstate, message, io, log, admins);
    }else if(message.includes('!givetaler') && admins.includes(userstate.username)){
      coincmds.giveTaler('whisper', client, users, userstate.username, userstate, message, io, log, admins);
    }else if(message.includes('!givecoins') && admins.includes(userstate.username)){
      coincmds.giveCoins('whisper', client, users, userstate.username, userstate, message, io, log, admins);
    }else if (message.includes('!sunshine')) {
      beetIo.emit('sunshine');
    }else if (message.includes('!addSession') && (admins.includes(userstate.username))){
      msg = message.split(' ');
      if(msg.length != 3){
        client.whisper(from, 'Ne. Benutz so: !addSession 1.12.19 -12');
        return
      }
      msg[2] = msg[2].replace(',', '.')
      if(isNaN(msg[2])){
        client.whisper(from, 'Ne. Benutz so: !addSession 1.12.19 -12');
        return;
      }
      sessions = misc.findOne({id:'sessions'});
      newNet = 100;
      if(sessions.data.length > 0){
        newNet = sessions.data[sessions.data.length-1].net;
      }
      sessions.data.push({label:msg[1], net:(parseInt(newNet) + parseInt(msg[2]))});
      client.whisper(from, 'Session hinzugefügt.')
    }else if(message == '!delSession' && admins.includes(userstate.username)){
      if(sessions.data.length < 1){return;}
      sessions.data.pop()
      client.whisper(from, 'Letzte Session gelöscht.');
    }
  }
}
