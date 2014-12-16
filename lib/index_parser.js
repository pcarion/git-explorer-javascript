(function() {
  "use strict";

  var fs = require("fs");


  function getBufferFromFile(fileName, done) {
    console.log("Reading :" + fileName);

    fs.exists(fileName, function(exists) {
      if (exists) {
        fs.stat(fileName, function(error, stats) {
          if (error) {
            return done(error);
          }

          fs.open(fileName, "r", function(error, fd) {
            if (error) {
              return done(error);
            }
            var buffer = new Buffer(stats.size);

            fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
              fs.close(fd);
              return done(null, buffer, bytesRead);
            });
          });
        });
      } else {
        return done(new Error("File does not exist", indexFile));
      }
    });
  }


  //
  // http://schacon.github.io/gitbook/7_the_git_index.html
  //
  // https://github.com/git/git/blob/master/Documentation/technical/index-format.txt
  // https://code.google.com/p/git-core/source/browse/Documentation/technical/index-format.txt?spec=svne44b6df90cfd6ccbf35c3d147ff5a0e4e22fb17a&r=e44b6df90cfd6ccbf35c3d147ff5a0e4e22fb17a
  //
  // https://github.com/chrisdickinson/git-packidx-parser/blob/master/index.js
  //
  // http://stackoverflow.com/questions/4084921/what-does-the-git-index-contain-exactly
  //
  function parseIndex(fileName, done) {
    getBufferFromFile(fileName, function(error, buffer, bytesRead) {
      if (error) {
        return done(error);
      }

      // check for the 'DIRC' signature
      if (buffer.readUInt32BE(0) !== 0x44495243) {
        return done(new Error("Invalid signature:"+Number(buffer.readUInt32BE(0)).toString(16)));
      }
      console.log("--");

      return done(null, "youpi!");
    });
  }


  parseIndex(".git/index", function(err, info) {
    if (err) {
      console.log("ERR:", err);
    } else {
      console.log("DONE");
    }
  });
}());