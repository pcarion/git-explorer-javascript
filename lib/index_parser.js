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

  // http://bocoup.com/weblog/getting-bitwise-with-javascript/
  function numToBinaryArray(num) {
    var res = [];
    var index, bitMask;

    for (bitMask = 0x80000000, index = 0; index < 32; bitMask >>>= 1, index++) {
      res[31 - index] = ((bitMask & num) ? 1 : 0);
    }


    console.log("" + num + " -> binary:"+res);
    return res;
  }

  function bufferReader(buffer, bytesRead) {
    var _buffer = buffer;
    var _delta = 0;
    var _bytesRead = bytesRead;

    return {
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

      readString: function() {
        var result = "";
        var state = 0;
        var len = 0;

        while (state !== 99) {
          var b = _buffer.readInt8(_delta);
          _delta++;
          len++;
          console.log("@@ (" + String.fromCharCode(b) + "),(" + b + "), at len=" + len + ",_delta:" + _delta);
          if (state === 0) {
            if (b === 0x00) {
              state = 1;
            } else {
              result = result + String.fromCharCode(b);
            }
          } else if (state === 1) {
            if (_delta % 8 === 0) {
              console.log("@@ delta:" + _delta);
              // var b = _buffer.readInt8(_delta + 1);
              // console.log("@@ next was:("+String.fromCharCode(b)+"),("+b+")");
              // var b = _buffer.readInt8(_delta + 2);
              // console.log("@@ next2 was:("+String.fromCharCode(b)+"),("+b+")");

              state = 99;
            } else {
              if (b !== 0x00) {
                throw new Error("bad string padding:" + b + ", with len:" + len);
              }
            }
          }
        }
        return result;
      },

      slice: function(length) {
        var result = _buffer.slice(_delta, _delta + length);
        _delta += length;
        return result;
      }
    }
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

      // prepare Buffer reader
      var br = bufferReader(buffer, bytesRead);

      // check for the 'DIRC' signature
      if (br.readUInt32BE() !== 0x44495243) {
        return done(new Error("Invalid signature:" + Number(buffer.readUInt32BE(0)).toString(16)));
      }

      var version = br.readUInt32BE();

      console.log("@@ version:" + version);

      var numberOfIndexEntries = br.readUInt32BE();

      console.log("@@ numberOfIndexEntries:" + numberOfIndexEntries);

      for (var i = 0; i < numberOfIndexEntries; i++) {
        var ctimeSeconds = br.readUInt32BE();
        var ctimeNanoSeconds = br.readUInt32BE();
        var mtimeSeconds = br.readUInt32BE();
        var mtimeNanoSeconds = br.readUInt32BE();
        var dev = br.readUInt32BE();
        var ino = br.readUInt32BE();
        console.log("@ ino:" + ino);
        var mode = br.readUInt32BE();
        var uid = br.readUInt32BE();
        console.log("@ uid:" + ino);
        var gid = br.readUInt32BE();
        var size = br.readUInt32BE();
        var sha1 = br.slice(20);
        var flags = br.readUInt16BE();
        console.log("@@ flags:" + flags);
        var nameLen = flags & 0x00000FFF
        console.log("nameLen is:" + nameLen)
        var pathName = br.readString();
        console.log("pathName:" + pathName);
      }

      console.log("--");

      return done(null, "youpi!");
    });
  }


  numToBinaryArray(0);
  numToBinaryArray(1);
  numToBinaryArray(128);
  numToBinaryArray(10);

  parseIndex(".git/index", function(err, info) {
    if (err) {
      console.log("ERR:", err);
    } else {
      console.log("DONE");
    }
  });
}());