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
        return done(new Error("File does not exist", fileName));
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


  function bufferReader(buffer, bytesRead) {
    var _buffer = buffer;
    var _delta = 0;
    var _mark = 0;
    var _bytesRead = bytesRead;

    return {
      readSignature: function() {
        var result = "";
        var sig = this.slice(4);
        for (var i = 0; i < 4; i++) {
          result += String.fromCharCode(sig[i]);
        }
        return result;
      },

      readUInt32BE: function() {
        var result = _buffer.readUInt32BE(_delta);
        _delta += 4;
        return result;
      },

      readUInt16BE: function() {
        var result = _buffer.readUInt16BE(_delta);
        _delta += 2;
        return result;
      },

      readInt8: function() {
        var result = _buffer.readInt8(_delta);
        _delta += 1;
        return result;
      },

      readParams: function() {
        var state = 0;
        var result = [];
        var current = "";

        while (state !== 99) {
          var b = this.readInt8();
          if (b === 0x00) {
            result.push(current);
            current = "";
            state = 99;
          } else {
            if (state === 0) {
              if (b === 0x20) {
                result.push(current);
                current = "";
                state = 1;
              } else {
                current = current + String.fromCharCode(b);
              }
            } else if (state === 1) {
              if (b != 0x20) {
                current = current + String.fromCharCode(b);
                state = 0;
              }
            }
          }
        }
        return result;
      },

      slice: function(length) {
        var result;
        if (length) {
          result = _buffer.slice(_delta, _delta + length);
          _delta += length;

        } else {
          result = _buffer.slice(_delta);
          _delta += result.length;
        }
        return result;
      },

      setMark: function() {
        _mark = _delta;
      },

      getMark: function() {
        return _delta - _mark;
      },

      offset: function() {
        return _delta;
      },

      remaining: function() {
        return _bytesRead - _delta;
      }
    };
  }



  module.exports = {
    getBufferFromFile: getBufferFromFile,
    getSHA1ForFile: getSHA1ForFile,
    bufferReader: function(buffer, bytesRead) {
      return bufferReader(buffer, bytesRead);
    }
  };
}());