(function() {
  "use strict";

  var fs = require("fs");
  var crypto = require('crypto');


  function getBufferFromFile(fileName, done) {
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

            if (stats.size > 0) {
              fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
                fs.close(fd);
                return done(null, buffer, bytesRead);
              });
            } else {
              fs.close(fd);
              return done(null, buffer, 0); 
            }
          });
        });
      } else {
        return done(new Error("File does not exist", indexFile));
      }
    });
  }

  function getSHA1ForFile(fileName, done) {
    getBufferFromFile(fileName, function(error, buffer, bytesRead) {
      if (error) {
        return done(error);
      }

      // git sha1 can be checked using 
      // $ git hash-object <file>
      // header description:
      // http://git-scm.com/book/en/v2/Git-Internals-Git-Objects#Object-Storage

      var shasum = crypto.createHash('sha1');
      shasum.update("blob " + bytesRead + "\0");
      shasum.update(buffer);
      return done(null, shasum.digest('hex'));
    });

  }


  module.exports = {
    getBufferFromFile: getBufferFromFile,
    getSHA1ForFile: getSHA1ForFile
  };
}());