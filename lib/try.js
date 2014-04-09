
var i = 0;
var stylusEditor;
var cssEditor;
var stylus = window.stylus;
var $ = window.$;
var CodeMirror = window.CodeMirror;

function next() {
  var tryme = $('#try');
  var steps = $('.step');
  var lastStep = steps.length - 1;
  var styl = tryme.find('.stylus');
  var css = tryme.find('.css');

  if (i < 0) {
    i = lastStep;
  }
  if (i > lastStep) {
    i = 0;
  }
  var step = steps.eq(i);

  if (i) {
    $('#prev').addClass('show');
  } else {
    $('#prev').removeClass('show');
  }

  if (i == lastStep) {
    $('#next').addClass('hide');
  } else {
    $('#next').removeClass('hide');
  }

  ++i;


  function render(_, e) {
    if (e) {
      if (e.type != 'keyup') return;
      switch (e.keyCode) {
        case 37:
        case 38:
        case 39:
        case 40:
          return;
      }
    }

    var str = stylusEditor
      .getValue()
      .trim()

    // str = $('pre.hidden').text() + '\n\n' + str;

    console.log('before', str);

    stylus(str)
      .render(function(err, str){
        if (err) return;
        console.log('rendered', str);
        // cssEditor.setValue(str.trim());
      });
  }

  var eds = $('.stylus');

  eds.each(function(i){
    var $t = $(this);
    console.log($t);
    window.t = $t;
  });

  // if (!stylusEditor) {
  //   stylusEditor = CodeMirror.fromTextArea(styl.get(0), { onKeyEvent: render });
  //   cssEditor = CodeMirror.fromTextArea(css.get(0));
  // }

  // tryme.find('h2').text(step.find('h2').text());
  // tryme.find('p:first').text(step.find('p:first').text());
  // stylusEditor.setValue(step.find('.stylus').val().trim());

  // render();
  return false;
}

function prev() {
  i -= 2;
  next();
  return false;
}

$(function(){
  $('#next').click(next);
  $('#prev').click(prev);
  next();
});
