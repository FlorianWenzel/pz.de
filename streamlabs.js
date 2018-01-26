module.exports = {
  on: function(eventData, io, users, log){
    if(eventData && eventData.message && eventData.message[0] && eventData.message[0]._id && streamlabsIDs.findOne({id: eventData.message[0]._id})){
      return;
    }else if(eventData && eventData.message && eventData.message[0] && eventData.message[0]._id){
      streamlabsIDs.insert({
        id: eventData.message[0]._id
      })
    }
    if (!eventData.for && eventData.type === 'donation') {
      user = users.findOne({name: eventData.message[0].from.toLowerCase()});
      if(!user){
        taler = Math.floor(10 * eventData.message[0].amount);
        log.addLog(logs, eventData.message[0].from.toLowerCase(), '404: ' + eventData.message[0].from.toLowerCase(), 'ZwiebelTaler', taler, (Math.floor(eventData.message[0].amount*100)/100).toString().replace('.', ',') + ' ' + eventData.message[0].currency + ' Donation')
        return;
      }
      taler = Math.floor(10 * eventData.message[0].amount);
      user.taler += taler;
      if(taler > 0){
        log.addLog(logs, user.name, user.name, 'ZwiebelTaler', taler, (Math.floor(eventData.message[0].amount*100)/100).toString().replace('.', ',') + ' ' + eventData.message[0].currency + ' Donation')
        io.to(user.name).emit('showNotification', 'success', '<strong>Vielen Dank</strong> für deine Donation ❤️ Dir wurden <strong>' + taler + ' ZwiebelTaler</strong> gutgeschrieben!');
        io.to(user.name).emit('updateTaler', user.taler);
      }
    }
    if(eventData.type === 'bits'){
      user = users.findOne({name: eventData.message[0].name.toLowerCase()});
      if(!user){
        return;
      }
      taler = Math.floor(parseInt(eventData.message[0].amount) / 10);
      user.taler += taler;
      if(taler > 0){
        log.addLog(logs, user.name, user.name, 'ZwiebelTaler', taler, eventData.message[0].amount + ' Bits')
        io.to(user.name).emit('showNotification', 'success', '<strong>Vielen Dank</strong> für deine Bits ❤️ Dir wurden <strong>' + taler + ' ZwiebelTaler</strong> gutgeschrieben!');
        io.to(user.name).emit('updateTaler', user.taler);
      }
    }
    if (eventData.for === 'twitch_account') {
      switch(eventData.type) {
        case 'follow':
          user = users.findOne({name: eventData.message[0].name.toLowerCase()});
          if(!user){
            return;
          }
          io.to(user.name).emit('showNotification', 'success', '<strong>Vielen Dank</strong> für deinen Follow ❤️!');
          break;
        case 'subscription':
          if(eventData.message[0].repeat){
            return;
          }
          user = users.findOne({name: eventData.message[0].name.toLowerCase()});
          if(!user){
            return;
          }
          switch (eventData.message[0].sub_plan) {
            case '1000':
              taler = 25;
              io.to(user.name).emit('updateTaler', user.taler);
              log.addLog(logs, user.name, user.name, 'ZwiebelTaler', taler, '4.99$ Sub')
              break;
            case 'Prime':
              taler = 25;
              io.to(user.name).emit('updateTaler', user.taler);
              log.addLog(logs, user.name, user.name, 'ZwiebelTaler', taler, 'Prime Sub')
              break;
            case '2000':
              taler = 50;
              io.to(user.name).emit('updateTaler', user.taler);
              log.addLog(logs, user.name, user.name, 'ZwiebelTaler', taler, '9.99$ Sub')
              break;
            case '3000':
              taler = 125;
              io.to(user.name).emit('updateTaler', user.taler);
              log.addLog(logs, user.name, user.name, 'ZwiebelTaler', taler, '24.99$ Sub')
              break;
            default:
              log.addLog(logs, user.name, 'Unbekannter Sub', 'Error', eventData, 'Sub')
              taler = 0;
          }
          io.to(user.name).emit('showNotification', 'success', '<strong>Vielen Dank</strong> für deinen Sub ❤️ Dir wurden <strong>' + taler + ' ZwiebelTaler</strong> gutgeschrieben!');
          user.taler += taler
          break;
      }
    }
  }
}
