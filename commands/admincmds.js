module.exports = {
  addcmd: function (platform, bot, commands, channel, message) {
    parts = message.split(" ")
    if(parts.length < 2){
      say(platform, bot, channel, 'Syntaxfehler, bitte überprüfe deine Eingabe.')
      return
    }
    if(commands.findOne({ command:parts[1]})){
      say(platform, bot, channel, 'Command existiert bereits, !editcmd ' + parts[1] + ' um es zu bearteiben.' )
      return
    }
    response = '';
    for(i=2;i<parts.length;i++){
      response += parts[i] + ' '
    }
    commands.insert({
      command: parts[1].toLowerCase(),
      response: response
    });
    say(platform, bot, channel, 'Command hinzugefügt, ' + parts[1] + ' gibt nun: "'+ response +'" aus.' )
  },
  editcmd: function (platform, bot, commands, channel, message) {
    parts = message.split(" ")
    if(parts.length < 2){
      say(platform, bot, channel, 'Syntaxfehler, bitte überprüfe deine Eingabe.')
      return
    }
    if(!commands.findOne({ command:parts[1]})){
      say(platform, bot, channel, 'Command existiert noch nicht, !addcmd ' + parts[1] + ' um es zu erstellen.')
      return
    }
    response = '';
    for(i=2;i<parts.length;i++){
      response += parts[i] + ' '
    }
    cmd = commands.findOne({ command:parts[1]});
    cmd.response = response;
    say(platform, bot, channel, 'Command ersetzt, ' + parts[1] + ' gibt nun: "'+ response +'" aus.' )
  },
  delcmd: function (platform, bot, commands, channel, message) {
      parts = message.split(" ")
      if(parts.length < 2){
        say(platform, bot, channel, 'Syntaxfehler, bitte überprüfe deine Eingabe.')
        return
      }
      if(!commands.findOne({ command:parts[1]})){
        say(platform, bot, channel, 'Command '+ parts[1] +' existert nicht.' )
        return
      }
      cmd = commands.findOne({ command:parts[1]});
      commands.remove(cmd);
      say(platform, bot, channel, 'Command ' + parts[1] + ' entfernt.' )
  },
  hidediscord: function (platform, bot, commands, channel, message) {
      parts = message.split(" ")
      if(parts.length < 2){
        say(platform, bot, channel, 'Syntaxfehler, bitte überprüfe deine Eingabe.')
        return
      }
      if(!commands.findOne({ command:parts[1]})){
        say(platform, bot, channel, 'Command '+ parts[1] +' existert nicht.')
        return
      }
      cmd = commands.findOne({ command:parts[1]});
      if(cmd.hidediscord){
        cmd.hidediscord = false;
        say(platform, bot, channel, 'Command ' + parts[1] + ' wird nun im Discord nicht mehr versteckt.')
      }else{
        cmd.hidediscord = true;
        say(platform, bot, channel, 'Command ' + parts[1] + ' wird nun im Discord versteckt.')
      }
  },
  hidetwitch: function (platform, bot, commands, channel, message) {
    parts = message.split(" ")
    if(parts.length < 2){
      say(platform, bot, channel, 'Syntaxfehler, bitte überprüfe deine Eingabe.')
      return
    }
    if(!commands.findOne({ command:parts[1]})){
      say(platform, bot, channel, 'Command '+ parts[1] +' existert nicht.')
      return
    }
    cmd = commands.findOne({ command:parts[1]});
    if(cmd.hidetwitch){
      cmd.hidetwitch = false;
      say(platform, bot, channel, 'Command ' + parts[1] + ' wird nun auf Twitch nicht mehr versteckt.')
    }else{
      cmd.hidetwitch = true;
      say(platform, bot, channel, 'Command ' + parts[1] + ' wird nun auf Twitch versteckt.')
    }
  },
  greet: function(bot, greet, channel){
    if(greet){
      greet = false;
      bot.say(channel, 'Begrüßung deaktiviert.')
    }else{
      greet = true;
      bot.say(channel, 'Begrüßung aktiviert.')
    }
    return greet;
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
