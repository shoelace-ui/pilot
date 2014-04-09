
var codedoc = require('codedoc');
var preload = document.getElementById('main').getAttribute('data-preload') || '';
var theme = 'chrome';

function filter(content, key, fn){
  if (key === 'stylus') return stylus(preload + '\n' + content).render(fn);
  if (key === 'markup' && content.charAt(0) !== '<') return fn(null, jade.render(content));
  fn(null, content);
}

function bind(id, fn){
  var ed = ace.edit(id);
  var mode = getMode(id);
  window.ed = ed;
  console.log(ed);

  setMode(mode);
  ed.setTheme('ace/theme/' + theme);
  ed.setHighlightActiveLine(false);
  ed.setShowPrintMargin(false);
  ed.setHighlightGutterLine(false);
  ed.setShowFoldWidgets(false);

  ed.getSession().on('change', function(e){
    var val = ed.getValue();
    fn(val);
    if (mode === 'jade' && val.charAt(0) === '<') setMode('html');
    if (mode === 'html' && val.charAt(0) !== '<') setMode('jade');
  });

  fn(ed.getValue());

  function setMode(name){
    ed.getSession().setMode('ace/mode/' + name);
    mode = name;
  }
}

function init(output){
  codedoc(document.getElementById(output), filter, bind);
}

function getMode(id){
  if (~id.indexOf('stylus')) return 'stylus';
  if (~id.indexOf('markup')) return 'jade';
}
