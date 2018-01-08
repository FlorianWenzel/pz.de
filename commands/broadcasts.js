module.exports = {
  addbrd: function (platform, bot, broadcasts, channel, message) {
    parts = message.split(" ")
    if(parts.length < 4){
      say(platform, bot, channel, 'Syntaxerror :( ! https://xentis.me/bot-dokumentation' )
      return
    }
    if(broadcasts.findOne({ id:parts[1].toLowerCase()})){
      say(platform, bot, channel, 'Broadcast existiert bereits.' )
      return
    }
    if(isNaN(parts[2]) || parts[2]%1 != 0){
      return
    }
    response = '';
    for(i=3;i<parts.length;i++){
      response += parts[i] + ' '
    }
    broadcasts.insert({
      id: parts[1].toLowerCase(),
      response: response,
      freq: parts[2],
      paused: false
    });
    say(platform, bot, channel, 'Broadcast hinzugefügt, ID:' + parts[1] + ' gibt nun: "'+ response +'" alle '+parts[2]+'s aus.' )
  },
  delbrd: function (platform, bot, broadcasts, channel, message) {
    parts = message.split(" ")
    if(!broadcasts.findOne({ id:parts[1]})){
      say(platform, bot, channel, 'Broadcast '+ parts[1] +' existert nicht.' )
      return
    }
    toRemove = broadcasts.findOne({ id:parts[1]});
    broadcasts.remove(toRemove);
    say(platform, bot, channel, 'Broadcast ID:' + parts[1] + ' entfernt.' )
  },
  playbrd: function (platform, bot, broadcastdb, channel, time) {
    var broadcasts = broadcastdb.where(function (obj) {
      return true;
    });
    for(i=0; i<broadcasts.length; i++){
      if(!broadcasts[i].paused && time % broadcasts[i].freq == 0)
        say(platform, bot, channel, broadcasts[i].response)
    }
  },
  pausebrd: function (platform, bot, broadcasts, channel, message) {
    parts = message.split(" ")
    if(!broadcasts.findOne({ id:parts[1]})){
      say(platform, bot, channel, 'Broadcast '+ parts[1] +' existert nicht.' )
      return
    }
    toPause = broadcasts.findOne({ id:parts[1]});
    if(toPause.paused){
      say(platform, bot, channel, 'Broadcast ID:' + parts[1] + ' ist bereits pausiert.' )
      return
    }
    toPause.paused = true
    say(platform, bot, channel, 'Broadcast ID:' + parts[1] + ' pausiert.' )
  },
  unpausebrd: function (platform, bot, broadcasts, channel, message) {
    parts = message.split(" ")
    if(!broadcasts.findOne({ id:parts[1]})){
      say(platform, bot, channel, 'Broadcast '+ parts[1] +' existert nicht.' )
      return
    }
    toPause = broadcasts.findOne({ id:parts[1]});
    if(!toPause.paused){
      say(platform, bot, channel, 'Broadcast ID:' + parts[1] + ' ist nicht pausiert.' )
      return
    }
    toPause.paused = false
    say(platform, bot, channel, 'Broadcast ID:' + parts[1] + ' unpausiert.' )
  },
  listbrd: function (platform, bot, broadcastdb, channel) {
    var broadcasts = broadcastdb.where(function (obj) {
      return true;
    });
    msg = '';
    for(i=0; i<broadcasts.length; i++){
      if(!broadcasts[i].paused){
        msg += 'ID: ' + broadcasts[i].id + ' gibt: "' + broadcasts[i].response + '" alle '+broadcasts[i].freq + 's aus.'
      }else{
        msg += 'ID: ' + broadcasts[i].id + ' ist pausiert. Und gibt: "' + broadcasts[i].response + '" alle '+broadcasts[i].freq + 's aus.'
      }
    }
    say(platform, bot, channel, msg)
  }
};
function say(platform, bot, channel, message){
  if(platform == 'discord'){
    bot.sendMessage({to:channel, message:message})
  }else if(platform == 'twitch'){
    bot.say(channel, message)
  }else if(platform == 'twitchwhisper'){
    bot.whisper(channel, message)
  }
}
