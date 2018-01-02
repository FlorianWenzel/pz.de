module.exports = {
  refreshStats: function(users, misc){
    onions = misc.findOne({id:'onions'});
    if(!onions){
      misc.insert({
        id:'onions',
        count: 0
      })
      onions = misc.findOne({id:'onions'})
    }
    onions.count = users.where(function(){return true;}).length;

    seenMinutes = misc.findOne({id:'seenMinutes'});
    if(!seenMinutes){
      misc.insert({
        id:'seenMinutes',
        count: 0
      })
      seenMinutes = misc.findOne({id:'seenMinutes'})
    }
    userList = users.where(function(){return true;});
    c = 0;
    for(i=0;i<users.length;i++){
      c += userList[i].coinsCollected;
    }
    seenMinutes.count = c;

    gambleStats = misc.findOne({id:'gambleStats'});
    userList = users.where(function(obj){if(obj.name != 'pokerzwiebel'){return true;}})

    if(!gambleStats){
      misc.insert({
        id:'gambleStats',
        global: 0,
        most: []
      })
      gambleStats = misc.findOne({id:'gambleStats'})
    }
    c = 0;
    for(i=0;i<userList.length;i++){
      if(userList[i].gambleNet){
        c += userList[i].gambleNet;
      }
    }
    gambleStats.global = c;
    usrs = users.where(function(obj){if(obj.name != 'pokerzwiebel'){return true;}})
    usrs = usrs.sort(function(a, b){
      if(Math.abs(a.gambleNet) == Math.abs(b.gambleNet)){return 0;}
      if(Math.abs(a.gambleNet) > Math.abs(b.gambleNet)){return -1;}
      if(Math.abs(a.gambleNet) < Math.abs(b.gambleNet)){return 1;}
    })
    max = 25;
    gambleStats.most = [];
    if(usrs.length < max){ max = usrs.length; }
    for ( i = 0; i < max; i++ ) {
      gambleStats.most.push({name: usrs[i].name, amount: usrs[i].gambleNet})
    }

    totalWateredOnions = misc.findOne({id:'totalWateredOnions'});
    if(!totalWateredOnions){
      misc.insert({
        id:'totalWateredOnions',
        count: 0
      })
      totalWateredOnions = misc.findOne({id:'totalWateredOnions'})
    }
    c = 0;
    for(i=0;i<userList.length;i++){
      if(userList[i].onionsWatered){
        c += userList[i].onionsWatered;
      }
    }
    totalWateredOnions.count = c;

    topGiesser = misc.findOne({id:'topGiesser'});
    if(!topGiesser){
      misc.insert({
        id:'topGiesser',
        value: 0
      })
      topGiesser = misc.findOne({id:'topGiesser'})
    }
    r = users.where(function(obj){return obj.onionsWatered > 0;});
    r.sort(function(a, b){
      if(a.onionsWatered == b.onionsWatered){return 0;}
      if(a.onionsWatered > b.onionsWatered){return -1;}
      if(a.onionsWatered < b.onionsWatered){return 1;}
    })
    r = r.slice(0, 25)
    res = [];
    for(i=0;i<r.length;i++){
      if(!r[i].onionsWatered){continue;}
      res[i] = {
        name: r[i].name,
        count: r[i].onionsWatered
      }
    }
    topGiesser.value = res;

    topChatter = misc.findOne({id:'topChatter'});
    if(!topChatter){
      misc.insert({
        id:'topChatter',
        value: 0
      })
      topChatter = misc.findOne({id:'topChatter'})
    }
    r = users.where(function(obj){return obj.messagesSent > 0;});
    r.sort(function(a, b){
      if(a.messagesSent == b.messagesSent){return 0;}
      if(a.messagesSent > b.messagesSent){return -1;}
      if(a.messagesSent < b.messagesSent){return 1;}
    })
    r = r.slice(0, 25)
    res = [];
    for(i=0;i<r.length;i++){
      if(!r[i].messagesSent){continue;}
      res[i] = {
        name: r[i].name,
        count: r[i].messagesSent
      }
    }
    topChatter.value = res;
  }
}
