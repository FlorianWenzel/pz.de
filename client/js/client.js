var pwCookie = Cookies.get('UID')
var usrCookie = Cookies.get('USR')
var usr;
var notifications = [];
var selfDestructions = [];

loadPage('home');
socket = io.connect()
autoLogin()

function autoLogin(){
  if(pwCookie && usrCookie){
    socket.emit('login', usrCookie, pwCookie);
  }
}

function loadPage(page){
  window.scrollTo(0, 0);
  $('#content').load('html/'+page+'.html')
}

function modal(a){
  switch (a) {
    case 'login':
      $('#modal').addClass('is-active')
      $('#modal-content').html(
          '<div class="field">' +
            '<div id="username-field-control" class="control has-icons-left">' +
              '<input id="username-field" class="input" type="text" placeholder="Benutzername">' +
              '<span class="icon is-small is-left">' +
                '<i class="fa fa-user"></i>' +
              '</span>' +
            '</div>' +
          '</div>' +
          '<div class="field">' +
            '<div id="password-field-control" class="control has-icons-left">' +
              '<input id="password-field" class="input" type="password" placeholder="Passwort">' +
                '<span class="icon is-small is-left">' +
                  '<i class="fa fa-lock"></i>' +
                '</span>' +
            '</div>' +
          '</div>' +
          '<div class="field">' +
            '<div class="control">' +
              '<a id="login-button" onclick="login();" class="button is-primary">Login</a> <a onclick="modal(\'register\')" class="button is-primary">Registrieren</a>' +
            '</div>' +
          '</div>' +
        '</div>');
      $('#username-field').keypress(function(event){
        if(event.keyCode == 13){
          $('#password-field').select();
        }
      });
      $('#password-field').keypress(function(event){
        if(event.keyCode == 13){
          $('#login-button').click();
        }
      });
      break;
    case 'register':
      $('#modal-content').html('Um dich zu registrieren musst du dem ZwiebelBot !password whispern, schreib dazu einfach "/w ZwiebeiBot !password" in irgendeinen Twitch-Chat (zB den weiter unten ⬇).<br> <strong>Wichtig</strong>: Das in der Mitte von Zwiebe<strong>L</strong>bot ist ein <strong>i</strong> !<br><br><a onclick="modal(\'login\')" class="button is-primary">Einloggen</a><br>'+
      '<iframe frameborder="<frameborder width>"' +
        'scrolling="no"' +
        'id="pokerzwiebel"' +
        'src="https://twitch.tv/pokerzwiebel/chat"' +
        'height="500"' +
        'width="' + $('#modal-content').width() +'"' +
      '</iframe>'
      )
      break;
    case 'close':
      $('#modal').removeClass('is-active')
      break;
    default:
  }
}

function showNotification(type, msg){
  id = notifications.length;
  notifications.push(id);
  $('#notifications').append(
    '<li id="notification-' + id + '" class="notification-li">' +
      '<div class="notification is-'+type+'">' +
        '<button onclick="deleteNotification('+id+')" class="delete"></button>' +
        msg +
      '</div>' +
    '</li>'
  )
}
function deleteNotification(id){
  console.log('lul')
  $('#notification-'+id).remove()
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
  $('#login-button-text').html('Abmelden?')
  $("#login-button-link").removeClass("is-primary is-warning is-danger is-info is-white is-dark");
  $("#login-button-link").addClass("is-danger");
  $("#login-button-link").attr("onclick","logout();");
  timeout = setInterval(function(){
    $('#login-button-text').html(user.name)
    $("#login-button-link").removeClass("is-primary is-warning is-danger is-info is-white is-dark");
    $("#login-button-link").addClass("is-primary");
    $("#login-button-link").attr("onclick","showLogout();");
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
