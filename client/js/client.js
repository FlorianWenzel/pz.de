var pwCookie = Cookies.get('UID')
var usrCookie = Cookies.get('USR')

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
            '<div class="control">' +
              '<input id="username-field" class="input" type="text" placeholder="Benutzername">' +
            '</div>' +
          '</div>' +
          '<div class="field">' +
            '<div class="control">' +
              '<input id="password-field" class="input" type="password" placeholder="Passwort">' +
            '</div>' +
          '</div>' +
          '<div class="field">' +
            '<div class="control">' +
              '<a onclick="login();" class="button is-primary">Login</a> <a onclick="modal(\'register\')" class="button is-primary">Registrieren</a>' +
            '</div>' +
          '</div>' +
        '</div>')
      break;
    case 'register':
      $('#modal-content').html('Um dich zu registrieren musst du dem ZwiebelBot !register whispern, schreib dazu einfach "/w ZwiebeiBot !register" in irgendeinen Twitch-Chat.<br> <strong>Wichtig</strong>: Das in der Mitte von Zwiebe<strong>L</strong>bot ist ein <strong>i</strong> !<br><br><a onclick="modal(\'login\')" class="button is-primary">Einloggen</a>')
      break;
    case 'close':
      $('#modal').removeClass('is-active')
      break;
    default:
  }
}

function login(){
  u = $('#username-field').val();
  p = $('#password-field').val();
  if(!p || !u){
    //TODO: Missing input
  }
  socket.emit('login', u, p);
}

socket.on('loginSuccessfull', function(user){
  Cookies.set('USR', user.name, { expires: 365})
  Cookies.set('UID', user.password, { expires: 365})
  modal('close')
  $('#login-button-text').html(user.name)
  $("#login-button-link").attr("onclick","");
  $('#coins-amount').html(user.coins);
  $('#taler-amount').html(user.taler);
  $('.currency-display').removeClass('hidden')
})

function em(input) {
    var emSize = parseFloat($("body").css("font-size"));
    return (emSize * input);
}
