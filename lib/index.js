/*!
 * Module dependencies.
 */

var markdown = require('github-flavored-markdown').parse;
var escape = require('./utils').escape;

module.exports = Pilot;

function Pilot(str, options){
  if (!(this instanceof Pilot))
    return new Pilot(str, options);
  this.str = str || '';
  this.options = options || {};
  return this.parseComments();
}

Pilot.prototype.parseComments = function(){
  var self = this;
  var options = self.options || {};
  var js = self.str.replace(/\r\n/gm, '\n');

  var comments = [];
  var raw = options.raw;
  var comment;
  var buf = '';
  var ignore;
  var withinMultiline = false;
  var withinSingle = false;
  var code;

  for (var i = 0, len = js.length; i < len; ++i) {
    // start comment
    if (!withinMultiline && !withinSingle && '/' == js[i] && '*' == js[i+1]) {
      // code following previous comment
      if (buf.trim().length) {
        comment = comments[comments.length - 1];
        if(comment) {
          comment.code = code = buf.trim();
          comment.ctx = self.parseCodeContext(code);
        }
        buf = '';
      }
      i += 2;
      withinMultiline = true;
      ignore = '!' == js[i];
    // end comment
    } else if (withinMultiline && !withinSingle && '*' == js[i] && '/' == js[i+1]) {
      i += 2;
      buf = buf.replace(/^[ \t]*\* ?/gm, '');
      var comment = self.parseComment(buf, options);
      comment.ignore = ignore;
      comments.push(comment);
      withinMultiline = ignore = false;
      buf = '';
    } else if (!withinSingle && !withinMultiline && '/' == js[i] && '/' == js[i+1]) {
      withinSingle = true;
      buf += js[i];
    } else if (withinSingle && !withinMultiline && '\n' == js[i]) {
      withinSingle = false;
      buf += js[i];
    // buffer comment or code
    } else {
      buf += js[i];
    }
  }

  if (comments.length === 0) {
    comments.push({
      tags: [],
      description: {full: '', summary: '', body: ''},
      isPrivate: false
    });
  }

  // trailing code
  if (buf.trim().length) {
    comment = comments[comments.length - 1];
    code = buf.trim();
    comment.code = code;
    comment.ctx = self.parseCodeContext(code);
  }

  return comments;
};

Pilot.prototype.parseComment = function(str, options) {
  str = str.trim();
  options = options || {};

  var self = this;
  var comment = { tags: [] };
  var raw = options.raw;
  var description = {};
  var examples = [];

  // parse comment body
  description.full = str.split('\n@')[0];
  description.summary = description.full.split('\n\n')[0];
  description.body = description.full.split('\n\n').slice(1).join('\n\n');
  comment.description = description;

  if (/^Example[s]?:/.exec(description.body)) {
    var str = description
          .body
          .split('\n')
          .slice(1)
          .filter(function(f){return f})
          .join('\n')
          .replace(/^  /gm, '');

    var type;
    var m;
    var out = {};
    var buff = [];

    while (str.length) {
      // ```type
      if (m = /^[\`]{3}(\w+)\n/.exec(str)) {
        type = m[1];
        str = str.slice(m[0].length);
      // contents
      } else if (m = /^([^\`].*)\n/.exec(str)) {
        buff.push(m[1]);
        str = str.slice(m[0].length);
      // ```
      } else if (m = /^[\`]{3}\n?/.exec(str)) {
        if (typeof type !== 'string')
          return console.error('something is wrong');
        str = str.slice(m[0].length);
        buff = buff.join('\n');
        if (type === 'jade') type = 'markup';
        out[type] = buff;
        type = null;
        buff = [];
      }
    }

    examples.push(out);
    comment.examples = examples;
  }

  // parse tags
  if (~str.indexOf('\n@')) {
    var tags = '@' + str.split('\n@').slice(1).join('\n@');
    comment.tags = tags.split('\n').map(self.parseTag);
    comment.isPrivate = comment.tags.some(function(tag){
      return 'api' == tag.type && 'private' == tag.visibility;
    })
  }

  // markdown
  if (!raw) {
    description.full = markdown(description.full);
    description.summary = markdown(description.summary);
    description.body = markdown(description.body);
  }

  return comment;
}

function parseTagTypes(str) {
  return str
    .replace(/[{}]/g, '')
    .split(/ *[|,\/] */);
};


Pilot.prototype.parseTag = function(str) {
  var self = this;
  var tag = {};
  var parts = str.split(/ +/);
  var type = tag.type = parts.shift().replace('@', '');
  var parse = parseTagTypes.bind(null);

  switch (type) {
    case 'param':
      tag.types = parse(parts.shift());
      tag.name = parts.shift() || '';
      tag.description = parts.join(' ');
      break;
    case 'return':
      tag.types = parse(parts.shift());
      tag.description = parts.join(' ');
      break;
    case 'see':
      if (~str.indexOf('http')) {
        tag.title = parts.length > 1
          ? parts.shift()
          : '';
        tag.url = parts.join(' ');
      } else {
        tag.local = parts.join(' ');
      }
    case 'api':
      tag.visibility = parts.shift();
      break;
    case 'type':
      tag.types = parse(parts.shift());
      break;
    case 'memberOf':
      tag.parent = parts.shift();
      break;
    case 'augments':
      tag.otherClass = parts.shift();
      break;
    case 'borrows':
      tag.otherMemberName = parts.join(' ').split(' as ')[0];
      tag.thisMemberName = parts.join(' ').split(' as ')[1];
      break;
    case 'throws':
      tag.types = parse(parts.shift());
      tag.description = parts.join(' ');
      break;
    default:
      tag.string = parts.join(' ');
      break;
  }

  return tag;
}

Pilot.prototype.parseCodeContext = function(str){
  var self = this;
  var str = str.split('\n')[0];

  // require/import
  if (/^@(require|import) [\'\"](.+)[\'\"]$/.exec(str)) {
    return {
        type: 'require'
      , name: RegExp.$2
      , string: RegExp.$2
      , value: RegExp.$2 + '.styl'
    };
  // variable assignment
  } else if (/^([\w][\w-]+)--(\w+) *[?]?= *?(.+)?/.exec(str)) {
    return {
        type: 'public variable'
      , name: RegExp.$2
      , string: RegExp.$1 + '--' + RegExp.$2 + ' = ' + RegExp.$3
      , value: RegExp.$3
    };
  } else if (/^--(.+)--(\w+)\((.+)\)/.exec(str)) {
    return {
        type: 'private function'
      , receiver: RegExp.$1
      , name: RegExp.$2
      , string: '--' + RegExp.$1 + '()'
    };
  } else if (/^([\w].+)\(([\w\,]+)\)/.exec(str)) {
    return {
        type: 'public function'
      , name: RegExp.$1
      , args: RegExp.$2
      , string: RegExp.$1 + '(_' + RegExp.$2 + '_)'
    };
  }
};
