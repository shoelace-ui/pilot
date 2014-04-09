
var lib = require('..');
var exec = require('child_process').exec;

describe('something', function(){
  it('should work', function(done){
    exec('bin/pilot-render -o test/index.html test/fixtures/c.styl', function(err, stdout){
      if (err) return done(err);
      console.log(stdout);
      done();
    });
  });
});
