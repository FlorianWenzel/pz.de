module.exports = {
  addLog: function(logs, trigger_username, receiver_username, currency, amount, type){
    date = new Date().getDate()+'.'+(new Date().getMonth() + 1) + '.'+new Date().getFullYear();
    if(type == 'Umgetauscht'){
      if(logs.findOne({trigger_username: trigger_username, receiver_username:receiver_username, currency: currency, time: date, type:type})){
        if(currency == 'ZwiebelCoins'){
          logs.findOne({trigger_username: trigger_username, receiver_username:receiver_username, currency: currency, time: date, type:type}).amount -= 1000;
        }
        if(currency == 'ZwiebelTaler'){
          logs.findOne({trigger_username: trigger_username, receiver_username:receiver_username, currency: currency, time: date, type:type}).amount += 1;
        }
        return;
      }
    }
    logs.insert({
      trigger_username: trigger_username.toLowerCase(),
      receiver_username: receiver_username.toLowerCase(),
      currency: currency,
      amount: amount,
      time: date,
      type: type
    });
    return;
  },
  getAllLogsTriggeredBy: function(logs, trigger_username){
    return logs.where({trigger_username: trigger_username});
  },
  getAllLogsReceivedBy: function(logs, receiver_username){
    return logs.where({receiver_username: receiver_username});
  },
  getFilteredLogs: function(logs, filter){
    filteredlogs = logs.where(function(obj){
      if(!filter.taler && obj.currency == 'ZwiebelTaler'){
        return false;
      }
      if(!filter.coins && obj.currency == 'ZwiebelCoins'){
        return false;
      }
      if(!(filter.receiver_username == '') && !obj.receiver_username.includes(filter.receiver_username)){
        return false;
      }
      if(!(filter.trigger_username == '') && !obj.trigger_username.includes(filter.trigger_username)){
        return false;
      }
      return true;
    })
    return filteredlogs;
  }
};
