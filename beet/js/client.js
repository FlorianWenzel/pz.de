var sock = io();

sock.on('increaseOnions', onIncrease);
sock.on('bohlen', function(number){
  document.getElementById('frame').src = 'http://www.dxj.de/smp/index.php?s=bohlen/' + number
})
sock.on('sunshine', function(){
  document.getElementById('sun').classList.remove('hide')
  var a = setInterval(function () {
    document.getElementById('sun').classList.add('hide')
    clearInterval(a)
    läuft = null;
  }, 10000)
})
function onIncrease(all, amount, username) {
    spinit(all, amount, username);
}
