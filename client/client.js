loadPage('home');


function loadPage(page){
  $('#content').load(page+'.html')
}

function em(input) {
    var emSize = parseFloat($("body").css("font-size"));
    return (emSize * input);
}
