
/**
 * Module dependencies.
 */

var pilot = require('../');
var should = require('should');
var fs = require('fs');

process.stdout.write('\u001B[2J');

function fixture(name, fn) {
  fs.readFile(__dirname + '/fixtures/' + name, 'utf8', fn);
}

module.exports = {
  'test .parseComments() blocks': function(done){
    fixture('a.styl', function(err, str){
      var comments = pilot.parseComments(str);
      var file = comments.shift();
      var version = comments.shift();
      file.should.have.property('ignore', true);
      file.description.full.should.equal(
        '<p>A<br />Copyright (c) 2014 Author Name <Author Email><br />MIT Licensed</p>');
      file.description.summary.should.equal(
        '<p>A<br />Copyright (c) 2014 Author Name <Author Email><br />MIT Licensed</p>');
      file.description.body.should.equal('');
      file.tags.should.be.empty;

      version.should.have.property('ignore', false);
      version.description.full.should.equal('<p>Library version.</p>');
      version.description.summary.should.equal('<p>Library version.</p>');
      version.description.body.should.equal('');
      version.tags.should.be.empty;
      done();
    });
  },

  'test .parseComments() tags': function(done){
    fixture('b.styl', function(err, str){
      var comments = pilot.parseComments(str);

      var version = comments.shift();
      version.description.summary.should.equal('<p>Library version.</p>');
      version.description.full.should.equal('<p>Library version.</p>');
      version.tags.should.have.length(2);
      version.tags[0].type.should.equal('type');
      version.tags[0].types.should.eql(['String']);
      version.tags[1].type.should.equal('api');
      version.tags[1].visibility.should.equal('public');
      version.ctx.type.should.equal('property');
      version.ctx.receiver.should.equal('exports');
      version.ctx.name.should.equal('version');
      version.ctx.value.should.equal("'0.0.1'");

      var parse = comments.shift();
      parse.description.summary.should.equal('<p>Parse the given <code>str</code>.</p>');
      parse.description.body.should.equal('<h2>Examples</h2>\n\n<pre><code>parse(str)\n// =&amp;gt; "wahoo"\n</code></pre>');
      parse.description.full.should.equal('<p>Parse the given <code>str</code>.</p>\n\n<h2>Examples</h2>\n\n<pre><code>parse(str)\n// =&amp;gt; "wahoo"\n</code></pre>');
      parse.tags[0].type.should.equal('param');
      parse.tags[0].name.should.equal('str');
      parse.tags[0].description.should.equal('to parse');
      parse.tags[0].types.should.eql(['String', 'Buffer']);
      parse.tags[1].type.should.equal('return');
      parse.tags[1].types.should.eql(['String']);
      parse.tags[2].visibility.should.equal('public');
      done();
    });
  },

  'test .parseComments() complex': function(done){
    fixture('c.styl', function(err, str){
      var comments = pilot.parseComments(str);

      var file = comments.shift();

      file.tags.should.be.empty;
      file.ignore.should.be.true;

      var version = comments.shift();
      version.tags.should.be.empty;
      version.description.full.should.equal('<p>Library version.</p>');

      var hash = comments.shift();
      hash.ctx.value.should.equal('{}');

      var devices = comments.shift();
      devices.ctx.type.should.include('variable');

      var unit = comments.shift();
      unit.ctx.value.should.equal('240');

      var calculateMQs = comments.shift();

      calculateMQs.tags.should.have.length(4);
      calculateMQs.ctx.type.should.include('function');
      // calculateMQs.ctx.receiver.should.equal('media-queries');
      // calculateMQs.ctx.name.should.equal('calculate');
      // calculateMQs.description.full.should.equal('<p>Generate <code>devices</code> with the given <code>size</code>.</p>');


      // calculateMQs.description.summary.should.equal('<p>Generate <code>devices</code> with the given <code>size</code>.</p>');
      // calculateMQs.description.body.should.equal('');

      var screenSizeAbove = comments.shift();
      // screenSizeAbove.tags.should.have.length(4);
      // screenSizeAbove.description.summary.should.equal('<p>Generate a query for screens above a given <code>size</code>.</p>');
      // screenSizeAbove.description.full.should.include('<p>Generate a query for screens above a given <code>size</code>.</p>\n\n<h2>Examples:</h2>');

      // screenSizeAbove.description.body.should.include('<h2>Examples:</h2>');


      var parseTag = comments.shift();

      // Should be the comment be parsed ?
      var shouldNotFail = comments.shift();

      var parseTagTypes = comments.shift();
      // parseTagTypes.tags.should.have.length(3);
      // parseTagTypes.description.full.should.equal('<p>Parse tag type string \"{Array|Object}\" etc.</p>');

      var escape = comments.pop();
      // escape.tags.should.have.length(3);
      // escape.description.full.should.equal('<p>Escape the given <code>html</code>.</p>');
      // escape.ctx.type.should.equal('function');
      // escape.ctx.name.should.equal('escape');
      done();
    });
  },

  'test .parseComments() tags with tabs': function (done) {
    fixture('d-tabs.styl', function (err, str) {
      var comments = pilot.parseComments(str);
      var first = comments.shift();

      first.tags.should.have.length(4);
      first.description.full.should.equal('<p>Parse tag type string "{Array|Object}" etc.</p>');
      first.description.summary.should.equal('<p>Parse tag type string "{Array|Object}" etc.</p>');
      first.description.body.should.equal('');
      // first.ctx.type.should.equal('method');
      // first.ctx.receiver.should.equal('exports');
      // first.ctx.name.should.equal('parseTagTypes');
      // first.code.should.equal('exports.parseTagTypes = function(str) {\n\t\treturn str\n\t\t\t.replace(/[{}]/g, \'\')\n\t\t\t.split(/ *[|,\\/] */);\n\t};');
      done();
    });
  },

  'test .parseComments() prototypes': function (done){
    fixture('prototypes.styl', function(err, str){
      var comments = pilot.parseComments(str)

      comments.should.be.an.instanceOf(Array);
      comments.should.have.lengthOf(3);

      // constructor
      comments[0].description.full.should.equal('<p>Does a lot of foo</p>');
      // comments[0].ctx.type.should.be.equal('function');
      // comments[0].ctx.name.should.be.equal('Foo');
      // comments[0].ctx.string.should.be.equal('Foo()');

      // comments[1].description.full.should.equal('<p>A property of an instance of Foo</p>');
      // comments[1].ctx.type.should.be.equal('property');
      // comments[1].ctx.name.should.be.equal('property');
      // comments[1].ctx.string.should.be.equal('Foo.prototype.property');

      // comments[2].description.full.should.equal('<p>A method of an instance of Foo</p>');
      // comments[2].ctx.type.should.be.equal('method');
      // comments[2].ctx.name.should.be.equal('method');
      // comments[2].ctx.string.should.be.equal('Foo.prototype.method()');

      done();
    });
  },

  'test .parseComments() tags': function (done){
    fixture('d.styl', function(err, str){
      var comments = pilot.parseComments(str);
      var first = comments.shift();
      first.tags.should.have.length(4);
      first.description.full.should.equal('<p>Parse tag type string "{Array|Object}" etc.</p>');
      first.description.summary.should.equal('<p>Parse tag type string "{Array|Object}" etc.</p>');
      first.description.body.should.equal('');
      // first.ctx.type.should.equal('method');
      // first.ctx.receiver.should.equal('exports');
      // first.ctx.name.should.equal('parseTagTypes');
      first.code.should.equal('parseTagTypes(str)\n  return str\n    .replace(/[{}]/g, \'\')\n    .split(/ *[|,\\/] */)');
      done();
    });
  },

  'test .parseComments() code': function(done){
    fixture('b.styl', function(err, str){
      var comments = pilot.parseComments(str);
      var version = comments.shift();
      var parse = comments.shift();

      version.code.should.equal("version = '0.0.1'");
      parse.code.should.equal('parse(str)\n  return "wahoo"');
      done();
    });
  },

  'test .parseComments() titles': function(done){
    fixture('titles.styl', function(err, str){
      var comments = pilot.parseComments(str);
      comments[0].description.body.should.include('<h2>Some examples</h2>');
      comments[0].description.body.should.not.include('<h2>for example</h2>');
      comments[0].description.body.should.include('<h2>Some longer thing for example</h2>');
      done();
    });
  },

  'test .parseCodeContext() function statement': function(){
    var ctx = pilot.parseCodeContext('function $foo(){\n\n}');
    ctx.type.should.equal('function');
    ctx.name.should.equal('$foo');
  },

  'test .parseCodeContext() function expression': function(){
    var ctx = pilot.parseCodeContext('var $foo = function(){\n\n}');
    ctx.type.should.equal('function');
    ctx.name.should.equal('$foo');
  },

  'test .parseCodeContext() prototype method': function(){
    var ctx = pilot.parseCodeContext('$User.prototype.$save = function(){}');
    ctx.type.should.equal('method');
    ctx.constructor.should.equal('$User');
    ctx.name.should.equal('$save');
  },

  'test .parseCodeContext() prototype property': function(){
    var ctx = pilot.parseCodeContext('$Database.prototype.$enabled = true;\nasdf');
    ctx.type.should.equal('property');
    ctx.constructor.should.equal('$Database');
    ctx.name.should.equal('$enabled');
    ctx.value.should.equal('true');
  },

  'test .parseCodeContext() method': function(){
    var ctx = pilot.parseCodeContext('$user.$save = function(){}');
    ctx.type.should.equal('method');
    ctx.receiver.should.equal('$user');
    ctx.name.should.equal('$save');
  },

  'test .parseCodeContext() property': function(){
    var ctx = pilot.parseCodeContext('$user.$name = "tj";\nasdf');
    ctx.type.should.equal('property');
    ctx.receiver.should.equal('$user');
    ctx.name.should.equal('$name');
    ctx.value.should.equal('"tj"');
  },

  'test .parseCodeContext() declaration': function(){
    var ctx = pilot.parseCodeContext('var $name = "tj";\nasdf');
    ctx.type.should.equal('declaration');
    ctx.name.should.equal('$name');
    ctx.value.should.equal('"tj"');
  },

  'test .parseTag() @constructor': function(){
    var tag = pilot.parseTag('@constructor');
    tag.type.should.equal('constructor');
  },

  'test .parseTag() @see': function(){
    var tag = pilot.parseTag('@see http://google.com');
    tag.type.should.equal('see');
    tag.title.should.equal('');
    tag.url.should.equal('http://google.com');

    var tag = pilot.parseTag('@see Google http://google.com');
    tag.type.should.equal('see');
    tag.title.should.equal('Google');
    tag.url.should.equal('http://google.com');

    var tag = pilot.parseTag('@see exports.parseComment');
    tag.type.should.equal('see');
    tag.local.should.equal('exports.parseComment');
   },

  'test .parseTag() @api': function(){
    var tag = pilot.parseTag('@api private');
    tag.type.should.equal('api');
    tag.visibility.should.equal('private');
  },

  'test .parseTag() @type': function(){
    var tag = pilot.parseTag('@type {String}');
    tag.type.should.equal('type');
    tag.types.should.eql(['String']);
  },

  'test .parseTag() @param': function(){
    var tag = pilot.parseTag('@param {String|Buffer}');
    tag.type.should.equal('param');
    tag.types.should.eql(['String', 'Buffer']);
    tag.name.should.equal('');
    tag.description.should.equal('');
  },

  'test .parseTag() @return': function(){
    var tag = pilot.parseTag('@return {String} a normal string');
    tag.type.should.equal('return');
    tag.types.should.eql(['String']);
    tag.description.should.equal('a normal string');
  },

  'test .parseTag() @augments': function(){
    var tag = pilot.parseTag('@augments otherClass');
    tag.type.should.equal('augments');
    tag.otherClass.should.equal('otherClass')
  },

  'test .parseTag() @author': function(){
    var tag = pilot.parseTag('@author Bob Bobson');
    tag.type.should.equal('author');
    tag.string.should.equal('Bob Bobson');
  },

  'test .parseTag() @borrows': function(){
    var tag = pilot.parseTag('@borrows foo as bar');
    tag.type.should.equal('borrows');
    tag.otherMemberName.should.equal('foo');
    tag.thisMemberName.should.equal('bar');
  },

  'test .parseTag() @memberOf': function(){
    var tag = pilot.parseTag('@memberOf Foo.bar')
    tag.type.should.equal('memberOf')
    tag.parent.should.equal('Foo.bar')
  },

  'test .parseTag() default': function(){
    var tag = pilot.parseTag('@hello universe is better than world');
    tag.type.should.equal('hello');
    tag.string.should.equal('universe is better than world');
  },

  'test .parseComments() code with no comments': function(done){
    fixture('uncommented.styl', function(err, str){
      var comments = pilot.parseComments(str)
        , all = comments.shift();
      all.code.should.equal("function foo() {\n  doSomething();\n}");
      done();
    });
  },

  'test .parseComments() with a simple single line comment in code': function(done){
    fixture('singleline.styl', function(err, str){
      var comments = pilot.parseComments(str)
        , all = comments.shift();
      all.code.should.equal("function foo() {\n  // Maybe useful\n  doSomething();\n}");
      done();
    });
  },

  'test .api() without inline code in comments': function(done) {
    fixture('a.styl', function(err, str){
      // var comments = pilot.parseComments(str);
      // var apiDocs = pilot.api(comments);
      // apiDocs.should.equal("  - [exports.version](#exportsversion)\n\n## exports.version\n\n  <p>Library version.</p>\n");
      done();
    });
  }
};
