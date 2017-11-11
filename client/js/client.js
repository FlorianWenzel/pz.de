var pwCookie = Cookies.get('UID')
var usrCookie = Cookies.get('USR')
var user;
var notifications = [];
var selfDestructions = [];
var audioNotifiaction = new Audio('sounds/notification.mp3');
var audioCoins = new Audio('sounds/coins.mp3');

loadPage('home');
socket = io.connect()
onload()

function onload(){
  //AUTO-LOGIN
  if(pwCookie && usrCookie){
    socket.emit('autoLogin', usrCookie, pwCookie);
    return;
  }
  if(document.location.href.includes('/login')){
    code = (document.location.href.split('&scope=')[0]).split('/login?code=')[1]
    socket.emit('auth', code)
  }
}

function loadPage(page){
  window.scrollTo(0, 0);
  $('#content').empty()
  $('#content').load('html/'+page+'.html')
}

function refreshProgressBar(){
  coins = parseInt($('#coins-amount').html())
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
}

function convert(){
  coins = parseInt($('#coins-amount').html())
  if(coins < 1000){
    showNotification('danger', 'Zu wenig ZwiebelCoins!')
    $( "#convertButton" ).addClass( "shake" )
    i = setInterval(function(){
      $( "#convertButton" ).removeClass( "shake" )
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

function showNotification(type, msg){
  if(type == 'danger' || type == 'info'){
    audioNotifiaction.pause();
    audioNotifiaction.currentTime = 0
    audioNotifiaction.play()
  }
  id = notifications.length;
  notifications.push(id);
  $('#notifications').append(
    '<li id="notification-' + id + '" class="notification-li fly-in">' +
      '<div class="notification is-'+type+'">' +
        '<button onclick="deleteNotification('+id+')" class="delete"></button>' +
        msg +
      '</div>' +
    '</li>'
  )
}

function deleteNotification(id){
  $( "#notification-"+id ).animate({
  opacity: 0.25,
  left: "+=50",
  height: "toggle"
}, 150, function() {
    $('#notification-'+id).remove()});
}

socket.on('updateCoins', function(amount){
  $('#coins-amount').html(amount);
  refreshProgressBar();
})

socket.on('updateTaler', function(amount){
  $('#taler-amount').html(amount);
})

socket.on('showNotification', function(type, msg){
  showNotification(type, msg);
})

socket.on('getLogs', function(logs, alllogs){
  if(alllogs){
    $('#logs').html(
      '<li id=\'log-head\'>' +
        '<div class="columns">' +
          '<div class="column prime">' +
            '<strong>Auslöser</strong>' +
          '</div>' +
          '<div class="column prime">' +
            '<strong>Empfänger</strong>' +
          '</div>' +
          '<div class="column prime">' +
            '<strong>Änderung</strong>' +
          '</div>' +
          '<div class="column prime">' +
            '<strong>Art</strong>' +
          '</div>' +
        '</div>' +
      '</li>'
    )
  }else{
    $('#logs').html(
      '<li id=\'log-head\'>' +
        '<div class="columns">' +
          '<div class="column prime">' +
            '<strong>Auslöser</strong>' +
          '</div>' +
          '<div class="column prime">' +
            '<strong>Änderung</strong>' +
          '</div>' +
          '<div class="column prime">' +
            '<strong>Art</strong>' +
          '</div>' +
        '</div>' +
      '</li>'
    )
  }
  for(i=0;i<logs.length;i++){
    color = 'blue';
    if(logs[i].type == 'setCoins' || logs[i].type == 'setTaler'){

    }else{
      if(logs[i].amount > 0){
        color = 'green'
      }else if(logs[i].amount < 0){
        color = 'rot'
      }
    }
    if(alllogs){
      $('#logs').append(
        '<li id=\'log-head\'>' +
          '<div class="columns">' +
            '<div class="column '+color+'" style="padding: auto; border-top: solid white 1px;">' +
              ''+logs[i].trigger_username+'' +
            '</div>' +
            '<div class="column '+color+'" style="padding: auto; border-top: solid white 1px;">' +
              ''+logs[i].receiver_username+'' +
            '</div>' +
            '<div class="column '+color+'" style="padding: auto; border-top: solid white 1px;">' +
              ''+logs[i].amount+' '+logs[i].currency+'' +
            '</div>' +
            '<div class="column '+color+'" style="padding: auto; border-top: solid white 1px;">' +
              ''+logs[i].type+'' +
            '</div>' +
          '</div>' +
      '</li>')
    }else{
      $('#logs').append(
        '<li id=\'log-head\'>' +
          '<div class="columns">' +
            '<div class="column '+color+'" style="padding: auto; border-top: solid white 1px;">' +
              ''+logs[i].trigger_username+'' +
            '</div>' +
            '<div class="column '+color+'" style="padding: auto; border-top: solid white 1px;">' +
              ''+logs[i].amount+' '+logs[i].currency+'' +
            '</div>' +
            '<div class="column '+color+'" style="padding: auto; border-top: solid white 1px;">' +
              ''+logs[i].type+'' +
            '</div>' +
          '</div>' +
      '</li>')
    }
  }
})

socket.on('loginSuccessful', function(usr, isMod){
  user = usr;
  Cookies.remove('USR')
  Cookies.remove('UID')
  Cookies.set('USR', user.name, { expires: 365})
  Cookies.set('UID', user.password, { expires: 365})
  $('#login-button-text').html(user.name)
  $("#login-button-link").attr("onclick","showLogout();");
  $("#login-button-link").removeClass("lila");
  $("#login-button-link").addClass("blue");
  $('#login-button-icon').removeClass('fa-twitch');
  $('#login-button-icon').addClass('fa-user');
  $('#coins-amount').html(user.coins);
  $('#taler-amount').html(user.taler);
  $('.currency-display').removeClass('hidden')
  $('#log-button').removeClass('hidden')
  window.history.pushState('home', 'PokerZwiebel', '/');
  if(isMod){
    $('#logs-button').removeClass('hidden');
  }
})

socket.on('loginUnsuccessful', function(){
  Cookies.remove('USR')
  Cookies.remove('UID')
  code = (document.location.href.split('&scope=')[0]).split('/login?code=')[1]
  socket.emit('auth', code)
})

function showLogout(){
  $('#login-button-text').html('Abmelden')
  $("#login-button-link").addClass("rot");
  $("#login-button-link").attr("onclick","logout();");
  $('#login-button-link').removeClass('blue');
  $('#login-button-icon').removeClass('fa-user');
  $('#login-button-icon').addClass('fa-sign-out');
  timeout = setInterval(function(){
    $('#login-button-text').html(user.name)
    $("#login-button-link").removeClass("rot");
    $("#login-button-link").attr("onclick","showLogout();");
    $('#login-button-icon').removeClass('fa-sign-out');
    $('#login-button-icon').addClass('fa-user');
    $("#login-button-link").addClass("blue");
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
