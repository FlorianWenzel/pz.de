loadPage('home');
io = io.connect()

function loadPage(page){
  window.scrollTo(0, 0);
  $('#content').load('pages/'+page+'.html')
}

function em(input) {
    var emSize = parseFloat($("body").css("font-size"));
    return (emSize * input);
}
