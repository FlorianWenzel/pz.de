var pwCookie = Cookies.get('UID')
var usrCookie = Cookies.get('USR')
var user;
var notifications = [];
var selfDestructions = [];
var audioNotifiaction = new Audio('sounds/notification.mp3');
var audioCoins = new Audio('sounds/coins.mp3');
var contactPerMail = false;
var contactPerTwitch = false;

socket = io.connect()

onload()
function onload(){
  //AUTO-LOGIN
  if(pwCookie && usrCookie){
    socket.emit('autoLogin', usrCookie, pwCookie);
  }
  if(document.location.href.includes('/login')){
    code = (document.location.href.split('&scope=')[0]).split('/login?code=')[1]
    socket.emit('auth', code)
    return;
  }
  if(document.location.href.includes('/')){

    code = (document.location.href.split('/')[3])
    if(code){
      loadPage(code)
    }else{
      loadPage('home')
    }
  }

}

$( window ).resize(function() {
  fitContentToNavbar();
});

$(document).ready (function() {
  $(".toggle").click(function() {
    toggleMobileMenu();
  });
  fitContentToNavbar();
});

function fitContentToNavbar(){
  $('#content').css('padding-top', $('#header').height())
}

function toggleMobileMenu(){
  $( ".menu" ).stop().slideToggle( "slow" );
  $('.m-icon').toggleClass('active');
}

function loadPage(page){
  window.scrollTo(0, 0);
  $('#content').empty()
  $('#content').load('html/'+page+'.html', null, function(response, status, xhr){
    if(page != 'home'){
      window.history.pushState({}, null, '/'+page);
    }else{
      window.history.pushState({}, null, '/');
    }
  })
}

function refreshProgressBar(){
  if(!user){return;}
  coins = user.coins;
  taler = user.taler;
  if(!$('#progressBar')){
    return;
  }
  if(coins > 1000){
    coins = 1000
  }
  $('#progressBar').attr('value', coins/1000 * 100)
  $('#progressText').html(coins + ' / 1000')
  if(coins < 333){
    $('#progressBar').removeClass('is-warning')
    $('#progressBar').removeClass('is-success')
    $('#progressBar').addClass('is-danger')
  }else if(coins < 666){
    $('#progressBar').removeClass('is-danger')
    $('#progressBar').removeClass('is-success')
    $('#progressBar').addClass('is-warning')
  }else{
    $('#progressBar').removeClass('is-warning')
    $('#progressBar').removeClass('is-danger')
    $('#progressBar').addClass('is-success')
  }
  if(coins >= 1000){
    $('#convertButton').removeClass('is-danger')
    $('#convertButton').addClass('is-success')
  }else{
    $('#convertButton').addClass('is-danger')
    $('#convertButton').removeClass('is-success')
  }
  if(taler > 200){
    $('#muetzeButton').removeClass('is-danger')
    $('#muetzeButton').addClass('is-success')
    $('#plueschButton').removeClass('is-danger')
    $('#plueschButton').addClass('is-success')
  }
}

function buy(product){
  if(!user){
    showNotification('danger', 'Bitte log dich erst ein!');
    return;
  }
  if(taler < 200){
    showNotification('danger', 'Zu wenig ZwiebelTaler!');
    return;
  }
  $('#confirmButton').removeClass('is-loading')
  $('#street').removeClass('is-danger')
  $('#plz').removeClass('is-danger')
  $('#email').removeClass('is-danger')
  $('#city').removeClass('is-danger')
  $('#print').removeClass('is-danger')
  $('#vorname').removeClass('is-danger')
  $('#name').removeClass('is-danger')
  $('#modal').addClass('is-active')
  $('#modal-header').html(product)
  $('#confirmButton').unbind('click');
  $('#confirmButton').bind('click', function() {
    $('#street').removeClass('is-danger')
    $('#plz').removeClass('is-danger')
    $('#city').removeClass('is-danger')
    $('#print').removeClass('is-danger')
    $('#vorname').removeClass('is-danger')
    $('#name').removeClass('is-danger')
    missedSomething = false;
    if(!$('#street').val()){
      $('#street').addClass('is-danger')
      missedSomething = true;
    }
    if(!$('#plz').val()){
      $('#plz').addClass('is-danger')
      missedSomething = true;
    }
    if(!$('#city').val()){
      $('#city').addClass('is-danger')
      missedSomething = true;
    }
    if(!$('#print').val()){
      $('#print').addClass('is-danger')
      missedSomething = true;
    }
    if(!$('#vorname').val()){
      $('#vorname').addClass('is-danger')
      missedSomething = true;
    }
    if(!$('#name').val()){
      $('#name').addClass('is-danger')
      missedSomething = true;
    }
    if(!$('#email').val() && contactPerMail){
      $('#email').addClass('is-danger')
      missedSomething = true;
    }

    if(missedSomething){
      return;
    }
    socket.emit('buy', usrCookie, pwCookie, product, $('#street').val(), $('#plz').val(), $('#city').val(), $('#print').val(), $('#misc').val(), $('#vorname').val(), $('#name').val(), $('#zusatz').val(), contactPerMail, contactPerTwitch, $('#email').val())
    $('#confirmButton').addClass('is-loading')
  });
}

function convert(){
  coins = parseInt($('.coins-amount').html())
  if(coins < 1000){
    showNotification('danger', 'Zu wenig ZwiebelCoins!')
    $("#convertButton").addClass("shake")
    i = setInterval(function(){
      $("#convertButton").removeClass("shake")
      clearInterval(i);
    }, 1000)
  }else{
    audioCoins.pause();
    audioCoins.currentTime = 0
    audioCoins.play()
    socket.emit('convert', usrCookie, pwCookie);
  }
}

function redirectToTwitch(){
  window.location = 'https://api.twitch.tv/kraken/oauth2/authorize?client_id=ui25tzwjmuypf8imx9jkevb49yvt3q&redirect_uri=http://pokerzwiebel.de/login&response_type=code&scope=&force_verify=true'
}

function showNotification(type, msg, dies){
  if(type == 'danger' || type == 'info'){
    audioNotifiaction.pause();
    audioNotifiaction.currentTime = 0
    audioNotifiaction.play()
  }
  id = notifications.length;
  notifications.push(id);
  $('#notifications').append(
    '<li id="notification-' + id + '" class="notification-li fly-in">' +
      '<div class="notification is-' + type + '">' +
        '<button onclick="deleteNotification('+id+')" class="delete"></button>' +
        msg +
      '</div>' +
    '</li>'
  )
  if(dies){
    selfDestructions.push(setTimeout(function(){
      deleteNotification(id);
    }, 1000))
  }
}

function deleteNotification(id){
  $( "#notification-"+id ).animate({
  opacity: 0.25,
  left: "+=50",
  height: "toggle"
}, 150, function() {
    $('#notification-'+id).remove()});
}

function toggleMail(){
  if(contactPerMail){
    contactPerMail = false;
    $('#mail-wrap').addClass('hidden')
  }else{
    contactPerMail = true;
    $('#mail-wrap').removeClass('hidden')
  }
}

function toggleTwitch(){
  if(contactPerTwitch){
    contactPerTwitch = false;
  }else{
    contactPerTwitch = true;
  }
}

socket.on('updateCoins', function(amount){
  user.coins = amount;
  $('.coins-amount').html(amount);
  refreshProgressBar();
})

socket.on('updateTaler', function(amount){
  user.taler = amount;
  $('.taler-amount').html(amount);
  refreshProgressBar();
})

socket.on('confirmPurchase', function(product){
  showNotification('success', 'Danke für deine Bestellung!')
  $('#modal').removeClass('is-active')
})

socket.on('canceledPurchase', function(product){
  showNotification('danger', 'Irgendwas lief schief, versuchs bitte später nochmal!')
  $('#modal').removeClass('is-active')
})

socket.on('showNotification', function(type, msg){
  showNotification(type, msg);
})

socket.on('getHomeStats', function(onions, minutes, msgs){
  increaseTo($('#onionCount'), onions)
  increaseTo($('#minutesCount'), minutes)
  increaseTo($('#msgsCount'), msgs)
})

socket.on('getProfile', function(discordID){
  $('#discordID').val(discordID)
  $('#discordID').addClass('is-success')
})

function increaseTo(e, num){
  let i = 0;
  let inter = setInterval(function(){
    i++;
    e.html('<strong>' + Math.floor((num/20)*i) + '</strong>')
    if(i >= 20){
      clearInterval(inter);
    }
  }, 50)
}

socket.on('getLogs', function(logs, alllogs, gambleNet, coinsCollected){
  if(alllogs){
    $('#logs').html(
      `<div class="columns">
        <div class="column dark">
          <strong>Datum</strong>
        </div>
        <div class="column dark">
          <strong>Auslöser</strong>
        </div>
        <div class="column dark">
          <strong>Empfänger</strong>
        </div>
        <div class="column dark">
          <strong>Änderung</strong>
        </div>
        <div class="column dark">
          <strong>Art</strong>
        </div>
      </div>`
    )
  }else{
    $('#gambleNet').html(gambleNet + ' ZwiebelCoins')
    $('#coinsCollected').html(coinsCollected + ' ZwiebelCoins')
    if(gambleNet<0){
      $('#gambleNetHead').addClass('is-danger')
      $('#gambleNetHead').removeClass('is-success')
    }
    $('#logs').html(
      `<div class="columns">
        <div class="column dark">
          <strong>Datum</strong>
        </div>
        <div class="column dark">
          <strong>Änderung</strong>
        </div>
        <div class="column dark">
          <strong>Art</strong>
        </div>
      </div>`
    )
  }
  for(i=0;i<logs.length;i++){
    amountColor = 'blue-text';
    amountPrefix = '';
    if(logs[i].type == 'setCoins' || logs[i].type == 'setTaler'){

    }else{
      if(logs[i].amount > 0){
        amountColor = 'green-text'
        amountPrefix = '+';
      }else if(logs[i].amount < 0){
        amountColor = 'red-text'
      }
    }
    if(i%2==0){color = 'light-grey'}else{color = 'dark'}
    if(alllogs){
      $('#logs').append(
        '<li>' +
          '<div class="columns">' +
            '<div class="column '+color+'">' +
              ''+logs[i].time +
            '</div>' +
            '<div class="column '+color+'">' +
              ''+logs[i].trigger_username+'' +
            '</div>' +
            '<div class="column '+color+'">' +
              ''+logs[i].receiver_username+'' +
            '</div>' +
            '<div class="column '+color+'">' +
              '<span class="'+amountColor+'">'+amountPrefix+logs[i].amount+' '+logs[i].currency+'</span>'+
            '</div>' +
            '<div class="column '+color+'">' +
              ''+logs[i].type+'' +
            '</div>' +
          '</div>' +
      '</li>')
    }else{
      $('#logs').append(
      `<li>
        <div class="columns">
          <div class="column `+color+`">
            `+logs[i].time +
          `</div>
          <div class="column `+color+`">` +
            `<span class="`+amountColor+`">`+amountPrefix+logs[i].amount+' '+logs[i].currency+'</span>'+
          `</div>
          <div class="column ` + color + '">' +
            logs[i].type +
          `</div>
        </div>
      </li>`)
    }
  }
})

socket.on('loginSuccessful', function(usr, isMod){
  user = usr;
  Cookies.remove('USR')
  Cookies.remove('UID')
  Cookies.set('USR', user.name, { expires: 365})
  Cookies.set('UID', user.password, { expires: 365})
  pwCookie = user.password;
  usrCookie = user.name;
  $('.login-button-text').html(user.name)
  $(".login-button-link").attr("onclick","showLogout();");
  $(".login-button-link").removeClass("lila");
  $(".login-button-link").addClass("blue");
  $('.login-button-icon').removeClass('fa-twitch');
  $('.login-button-icon').addClass('fa-user');
  $('.coins-amount').html(user.coins);
  $('.taler-amount').html(user.taler);
  $('.currency-display').removeClass('hidden')
  $('.log-button').removeClass('hidden')
  if(isMod){
    $('.logs-button').removeClass('hidden');
  }
  if(window.location.pathname.includes('/login')){
    loadPage('home');
  }
})

socket.on('loginUnsuccessful', function(){
  Cookies.remove('USR')
  Cookies.remove('UID')
  code = (document.location.href.split('&scope=')[0]).split('/login?code=')[1]
  socket.emit('auth', code)
})


socket.on('getChallengeStats', function(data){
  labels = [];
  series = [];
  for(i=0;i<data.length;i++){
    if(i==0){
      labels.push('Bankroll')
    }else{
      labels.push(i)
    }
    series.push(data[i].net - 100)
  }
  new Chartist.Line('#challenge', {
    labels: labels,
    series: [
      series
    ]
  }, {
    showPoint: true,
    referenceValue: 100,
    height: '500px',
    showArea: true,
    axisY: {
      onlyInteger: true,
      labelInterpolationFnc: function(value) {
        return value + 100 + '$'
      },
      low: -100
    },
    plugins: [
      Chartist.plugins.ctThreshold({
        threshold: 0
      })
    ]
  });
})

socket.on('getGiessenStats', function(totalWateredOnions, topGiesser){
  $('#totalWateredOnions').html(totalWateredOnions)
  labels = [];
  series = [];
  for(i=0;i<topGiesser.length;i++){
    labels.push(topGiesser[i].name)
    series.push(topGiesser[i].count)
  }
  new Chartist.Bar('#giesser', {
    labels: labels,
    series: [
      series
    ]
  }, {
    seriesBarDistance: 0,
    reverseData: true,
    horizontalBars: true,
    axisX: {
     onlyInteger: true,
     offset: 15
    },
    axisY: {
      offset: 150
    },
    height: topGiesser.length*30+'px',
    chartPadding: {
      right: 50
    }
  });
})

socket.on('getGambleStats', function(gambleStats){
  $('#totalGambleAmount').html(gambleStats.global)
  labels = [];
  series = [];
  most = gambleStats.most;
  for(i=0;i<most.length;i++){
    labels.push(most[i].name)
    series.push(most[i].amount)
  }
  var data = {
    labels: labels,
    series: [
      series
    ]
  };

  var options = {
    horizontalBars: true,
    seriesBarDistance: 10,
    reverseData: true,
    height: '750px',
    axisX: {
     onlyInteger: true,
     offset: 15
    },
    axisY: {
      offset: 150
    },
  };

  var responsiveOptions = [
    ['screen and (max-width: 640px)', {
      seriesBarDistance: 5,
      axisX: {
        labelInterpolationFnc: function (value) {
          return value[0];
        }
      }
    }]

  ];

  new Chartist.Bar('#gambleStats', data, options, responsiveOptions);
})

socket.on('getChatterStats', function(totalMessagesSent, topChatter){
  $('#totalMessagesSent').html(totalMessagesSent)
  labels = [];
  series = [];
  for(i=0;i<topChatter.length;i++){
    labels.push(topChatter[i].name)
    series.push(topChatter[i].count)
  }
  new Chartist.Bar('#chatter', {
    labels: labels,
    series: [
      series
    ]
  }, {
    seriesBarDistance: 0,
    reverseData: true,
    horizontalBars: true,
    axisX: {
     onlyInteger: true,
     offset: 15
    },
    axisY: {
      offset: 150
    },
    height: topChatter.length*30+'px',
    chartPadding: {
      right: 50
    }
  });
})

function showLogout(){
  loadPage('profil')
  $('.login-button-text').html('Abmelden')
  $(".login-button-link").addClass("rot");
  $(".login-button-link").attr("onclick","logout();");
  $('.login-button-link').removeClass('blue');
  $('.login-button-icon').removeClass('fa-user');
  $('.login-button-icon').addClass('fa-sign-out');
  timeout = setInterval(function(){
    $('.login-button-text').html(user.name)
    $(".login-button-link").removeClass("rot");
    $(".login-button-link").attr("onclick","showLogout();");
    $('.login-button-icon').removeClass('fa-sign-out');
    $('.login-button-icon').addClass('fa-user');
    $(".login-button-link").addClass("blue");
    clearInterval(timeout);
  }, 1500)
}

function logout() {
  clearInterval(timeout);
  Cookies.remove('UID');
  Cookies.remove('USR');
  location.reload();
}

function em(input) {
    var emSize = parseFloat($("body").css("font-size"));
    return (emSize * input);
}
