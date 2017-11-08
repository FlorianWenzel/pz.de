module.exports = {
  addLog: function(logs, trigger_username, receiver_username, currency, amount, type){
    logs.insert({
      trigger_username: trigger_username.toLowerCase(),
      receiver_username: receiver_username.toLowerCase(),
      currency: currency,
      amount: amount,
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
    console.log(filter)
    filteredlogs = logs.where(function(obj){
      if(!filter.taler && obj.currency == 'taler'){
        return false;
      }
      if(!filter.coins && obj.currency == 'coins'){
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
