var pwCookie = Cookies.get('UID')
var usrCookie = Cookies.get('USR')
var usr;
var notifications = [];
var selfDestructions = [];

loadPage('home');
socket = io.connect()
onload()

function onload(){
  //AUTO-LOGIN
  if(pwCookie && usrCookie){
    socket.emit('login', usrCookie, pwCookie);
    return;
  }
  if(document.location.href.includes('/login')){
    console.log('login')
    code = (document.location.href.split('&scope=')[0]).split('/login?code=')[1]
    socket.emit('auth', code)
  }
}

function loadPage(page){
  window.scrollTo(0, 0);
  $('#content').load('html/'+page+'.html')
}

function redirectToTwitch(){
  window.location = 'https://api.twitch.tv/kraken/oauth2/authorize?client_id=ui25tzwjmuypf8imx9jkevb49yvt3q&redirect_uri=http://pokerzwiebel.de/login&response_type=code&scope=channel_check_subscription'
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

function login(){
  u = $('#username-field').val();
  p = $('#password-field').val();
  if(p == '' || u == ''){
    if(!u){
      $('#username-field').addClass('is-danger')
    }
    if(!p){
      $('#password-field').addClass('is-danger')
    }
    return;
  }
  $('#password-field-control').addClass('is-loading')
  $('#username-field-control').addClass('is-loading')
  socket.emit('login', u, p);
}
socket.on('updateCoins', function(amount){
  $('#coins-amount').html(amount);
})+

socket.on('loginSuccessfull', function(usr){
  user = usr;
  Cookies.set('USR', user.name, { expires: 365})
  Cookies.set('UID', user.password, { expires: 365})
  modal('close')
  $('#login-button-text').html(user.name)
  $("#login-button-link").attr("onclick","showLogout();");
  $('#coins-amount').html(user.coins);
  $('#taler-amount').html(user.taler);
  $('.currency-display').removeClass('hidden')
})

socket.on('loginUnsuccessful', function loginUnsuccessful(){
  $('#password-field-control').removeClass('is-loading')
  $('#username-field-control').removeClass('is-loading')
  $('#username-field').addClass('is-danger');
  $('#password-field').addClass('is-danger');
  showNotification('danger', 'Falscher Benutzername oder falsches Passwort!')
})


function showLogout(){
  $('#login-button-text').html('Abmelden')
  $("#login-button-link").removeClass("is-primary is-warning is-danger is-info is-white is-dark");
  $("#login-button-link").addClass("is-danger");
  $("#login-button-link").attr("onclick","logout();");
  $('#login-button-icon').removeClass('fa-user');
  $('#login-button-icon').addClass('fa-sign-out');
  timeout = setInterval(function(){
    $('#login-button-text').html(user.name)
    $("#login-button-link").removeClass("is-primary is-warning is-danger is-info is-white is-dark");
    $("#login-button-link").addClass("is-primary");
    $("#login-button-link").attr("onclick","showLogout();");
    $('#login-button-icon').removeClass('fa-sign-out');
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
