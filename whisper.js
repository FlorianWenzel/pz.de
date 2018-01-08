module.exports = {
  on: function(admincmds, broadcast, commands, broadcasts, msgCounter, account, casino, coincmds, client, users, io, log, misc, beetIo, from, userstate, message, self, admins){
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

    if(admins.includes(from)){
      if (message.includes('!addcmd')){
        admincmds.addcmd('twitchwhisper', client, commands, from, message);
        return;
      //EDITCMD
      }else if(message.includes('!editcmd')){
        admincmds.editcmd('twitchwhisper', client, commands, from, message);
        return;
      //DELCMD
      }else if(message.includes('!delcmd')){
        admincmds.delcmd('twitchwhisper', client, commands, from, message);
        return;
      //HIDE
      }else if(message.includes('!hidediscord') && admins.includes(userID)){
        admincmds.hidediscord('twitchwhisper', client, commands, from, message);
      }else if(message.includes('!hidetwitch') && admins.includes(userID)){
        admincmds.hidetwitch('twitchwhisper', client, commands, from, message);
      //BROADCASTS
      }else if(message.toLowerCase().includes('!addbrd')){
        broadcast.addbrd('twitchwhisper', client, broadcasts, from, message);
      }else if(message.toLowerCase().includes('delbrd')){
        broadcast.delbrd('twitchwhisper', client, broadcasts, from, message);
      }else if(message.toLowerCase().includes('listbrd')){
        broadcast.listbrd('twitchwhisper', client, broadcasts, from);
      }else if(message.toLowerCase().includes('pausebrd') && !message.toLowerCase().includes('unpause')){
        broadcast.pausebrd('twitchwhisper', client, broadcasts, from, message);
      }else if(message.toLowerCase().includes('unpausebrd')){
        broadcast.unpausebrd('twitchwhisper', client, broadcasts, from, message);
      }
    }

    msg = message.split(" ")
    if(msg.length == 1 && commands.findOne({ command:msg[0].toLowerCase()})){
      client.whisper( from, commands.findOne({ command:msg[0].toLowerCase()}).response)
    }

    //LIST COMMANDS
    if(message  ===  '!commands'){
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
      client.whisper(from, msg)
    }
  }
}
