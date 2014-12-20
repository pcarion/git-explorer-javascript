(function() {
  "use strict";

  var fs = require("fs");
  var buf_util = require("./buffer_util");
  var path = require("path");
  var zlib = require('zlib');
  var util = require('util');

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

  function parseTreeEntries(buffer) {
    var result = [];

    var br = buf_util.bufferReader(buffer, buffer.length);

    while (br.remaining() > 0) {
      var params = br.readParams();

      var o = {
        mode: params[0],
        name: params[1],
        sha1: br.slice(20).toString('hex')
      };
      result.push(o);
    }

    return result;
  }

  // https://www.kernel.org/pub/software/scm/git/docs/user-manual.html#object-details
  // http://stackoverflow.com/questions/14790681/format-of-git-tree-object
  // http://git.rsbx.net/Documents/Git_Data_Formats.txt
  function parseObject(fileName, done) {
    buf_util.getBufferFromFile(fileName, function(error, compressedBuffer) {
      if (error) {
        return done(error);
      }

      zlib.inflate(compressedBuffer, function(err, buffer) {
        if (err) {
          return done(err);
        }

        var br = buf_util.bufferReader(buffer, buffer.length);

        var params = br.readParams();

        var info = {
          fileName: fileName,
          type: params[0],
          length: params[1]
        };

        if (info.type === 'tree') {
          info.content = parseTreeEntries(br.slice());
        } else if (info.type === 'blob') {
          // we don't parse blob
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
      console.log("OK:", util.inspect(info, {
        depth: null
      }));
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