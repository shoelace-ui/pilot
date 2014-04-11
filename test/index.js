
var lib = require('..');
var exec = require('child_process').exec;
var fs = require('fs');

fs.readdirSync('test/fixtures').forEach(function(dir){
  if (~dir.indexOf('.')) return;
  var path = 'test/fixtures/' + dir + '/';
  describe(dir, function(){
    it('should render', function(done){
      exec('bin/pilot-render -o ' + path+'index.html ' + path+'index.styl', function(err, stdout){
        if (err) return done(err);
        console.log(stdout);
        done();
      });
    });
  });
});
