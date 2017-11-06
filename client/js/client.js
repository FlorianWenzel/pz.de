var pwCookie = Cookies.get('UID')
var usrCookie = Cookies.get('USR')
var user;
var notifications = [];
var selfDestructions = [];

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
    socket.emit('convert', usrCookie, pwCookie);
  }
}

function redirectToTwitch(){
  window.location = 'https://api.twitch.tv/kraken/oauth2/authorize?client_id=ui25tzwjmuypf8imx9jkevb49yvt3q&redirect_uri=http://pokerzwiebel.de/login&response_type=code&scope=&force_verify=true'
}

function showNotification(type, msg){
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

socket.on('loginSuccessfull', function(usr){
  user = usr;
  Cookies.set('USR', user.name, { expires: 365})
  Cookies.set('UID', user.password, { expires: 365})
  $('#login-button-text').html(user.name)
  $("#login-button-link").attr("onclick","showLogout();");
  $("#login-button-link").removeClass("lila");
  $("#login-button-link").addClass("is-info");
  $('#login-button-icon').removeClass('fa-twitch');
  $('#login-button-icon').addClass('fa-user');
  $('#coins-amount').html(user.coins);
  $('#taler-amount').html(user.taler);
  $('.currency-display').removeClass('hidden')
  window.history.pushState('home', 'PokerZwiebel', '/');
})

function showLogout(){
  $('#login-button-text').html('Abmelden')
  $("#login-button-link").removeClass("is-primary is-warning is-danger is-info is-white is-dark");
  $("#login-button-link").addClass("is-danger");
  $("#login-button-link").attr("onclick","logout();");
  $('#login-button-link').removeClass('is-info');
  $('#login-button-icon').removeClass('fa-user');
  $('#login-button-icon').addClass('fa-sign-out');
  timeout = setInterval(function(){
    $('#login-button-text').html(user.name)
    $("#login-button-link").removeClass("is-primary is-warning is-danger is-info is-white is-dark");
    $("#login-button-link").attr("onclick","showLogout();");
    $('#login-button-icon').removeClass('fa-sign-out');
    $('#login-button-link').addClass('is-info');
    $('#login-button-icon').addClass('fa-user');
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
