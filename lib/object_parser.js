(function() {
  "use strict";

  var fs = require("fs");
  var buf_util = require("./buffer_util");
  var path = require("path");
  var zlib = require('zlib');

  var reLevel0 = /^[A-Za-z0-9]{2}$/;

  function walk(dir, level, prefix, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      var i = 0;
      (function next() {
        var file = list[i++];
        if (!file) return done(null, results);

        if (level === 0) {
          if (reLevel0.test(file)) {
            walk(dir + '/' + file, 1, file, function(err, res) {
              results = results.concat(res);
              next();
            });
          } else {
            next();
          }
        } else if (level === 1) {
          results.push({
            sha1: prefix + file,
            file: dir + "/" + file
          });
          next();
        } else {
          next();
        }
      }());
    });
  }

  // https://www.kernel.org/pub/software/scm/git/docs/user-manual.html#object-details
  function parseObject(fileName, done) {
    buf_util.getBufferFromFile(fileName, function(error, comoressedBuffer, bytesRead) {
      if (error) {
        return done(error);
      }

      zlib.inflate(comoressedBuffer, function(err, buffer) {
        if (err) {
          return done(err);
        }

        // reading header
        var delta = 0;
        var state = 0;
        var type = "";
        var length = "";

        while (state !== 99) {
          var b = buffer.readInt8(delta);
          delta++;
          if (b === 0x00) {
            state = 99;
          } else {
            if (state === 0) {
              if (b === 0x20) {
                state = 1;
              } else {
                type = type + String.fromCharCode(b);
              }
            } else if (state === 1) {
              length = length + String.fromCharCode(b);
            }
          }
        }

        var info = {
          fileName: fileName,
          type: type,
          length: length
        };

        if (type !== 'blob') {
          info.content = buffer.slice(delta + 1).toString("UTF-8");
        }

        console.log(info);
        return done(null, info);
      });

    });
  }

  function parseObjects(ojbectsDirectory, done) {

    walk(ojbectsDirectory, 0, "", function(err, files) {
      var results = [];
      if (err) {
        return done(err);
      }

      var i = 0;
      (function next() {
        var file = files[i++];
        if (!file) return done(null, results);
        parseObject(file.file, function(err, result) {
          if (err) {
            return done(err);
          }
          result.sha1 = file.sha1;
          results.push(result);
          next();
        });
      }());
    });
  }

  parseObjects(path.join("./.git", "objects"), function(err, info) {
    if (err) {
      console.log("Error:" + err);
    } else {
      console.log("OK:", info);
    }
  });

  module.exports = function(gitDirectory, done) {
    parseObjects(path.join(gitDirectory, "objects"), function(err, info) {
      if (err) {
        return done(err);
      } else {
        return done(null, info);
      }
    });

  };



}());