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

  function checkNul(buffer) {
    for(var i = 0; i < buffer.length; i++) {
      if (buffer[i] !== 0) {
        throw new Error("buffer nul check failed!");
      }
    }
  }


  // http://bocoup.com/weblog/getting-bitwise-with-javascript/
  function numToBinaryArray(num) {
    var res = [];
    var index, bitMask;

    for (bitMask = 0x80000000, index = 0; index < 32; bitMask >>>= 1, index++) {
      res[31 - index] = ((bitMask & num) ? 1 : 0);
    }

    // console.log("" + num + " -> binary:"+res);
    return res;
  }

  function bufferReader(buffer, bytesRead) {
    var _buffer = buffer;
    var _delta = 0;
    var _mark = 0;
    var _bytesRead = bytesRead;

    return {
      readSignature: function() {
        var result ="";
        var sig = this.slice(4);
        for(var i = 0; i < 4 ; i++) {
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
    }
  }


  //
  // http://schacon.github.io/gitbook/7_the_git_index.html
  //
  // https://github.com/git/git/blob/master/Documentation/technical/index-format.txt
  // https://code.google.com/p/git-core/source/browse/Documentation/technical/index-format.txt?spec=svne44b6df90cfd6ccbf35c3d147ff5a0e4e22fb17a&r=e44b6df90cfd6ccbf35c3d147ff5a0e4e22fb17a
  //
  // https://github.com/chrisdickinson/git-packidx-parser/blob/master/index.js
  // https://github.com/sbp/gin/blob/master/gin
  //
  // http://stackoverflow.com/questions/4084921/what-does-the-git-index-contain-exactly
  //
  function parseIndex(fileName, done) {
    getBufferFromFile(fileName, function(error, buffer, bytesRead) {
      if (error) {
        return done(error);
      }

      var info = {};

      // prepare Buffer reader
      var br = bufferReader(buffer, bytesRead);

      // check for the 'DIRC' 
      if (br.readSignature() !== "DIRC") {
        return done(new Error("Invalid signature:" + Number(buffer.readUInt32BE(0)).toString(16)));
      }

      info.version = br.readUInt32BE();

      info.numberOfIndexEntries = br.readUInt32BE();

      info.entries = [];

      for (var i = 0; i < info.numberOfIndexEntries; i++) {
        var entry = {};
        info.entries.push(entry);

        // we mark the beginning of the record
        // in order to allow padding computation
        br.setMark();
        entry.index = i;
        var ctimeSeconds = br.readUInt32BE();
        var ctimeNanoSeconds = br.readUInt32BE();
        var mtimeSeconds = br.readUInt32BE();
        var mtimeNanoSeconds = br.readUInt32BE();
        var dev = br.readUInt32BE();
        var ino = br.readUInt32BE();
        entry.mode = Number(br.readUInt32BE()).toString(8);
        entry.uid = br.readUInt32BE();
        var gid = br.readUInt32BE();
        entry.size = br.readUInt32BE();
        entry.sha1 = br.slice(20).toString('hex');

        entry.flags = br.readUInt16BE();
        var bits = numToBinaryArray(entry.flags);

        entry.assume_valid = (bits[15] == 1);
        entry.extended_flag = (bits[14] == 1);
        entry.stage = ((bits[13] * 8) + bits[12]);
        entry.nameLen = entry.flags & 0x00000FFF

        // TODO:
        // test if extended and version 3

        if (entry.nameLen < 0xFFF) {
          entry.pathName = br.slice(entry.nameLen).toString();
        } else {
          // TODO
        }

        var entryLen = br.getMark();
        var padlen = (8 - (entryLen % 8)) || 8;
        var nul = br.slice(padlen);
        checkNul(nul);
      }
      console.log("remaining data:"+br.remaining());

      // the last 20 bytes are the sha1 of the index file
      // the extensions are between here and the sha
      while(br.remaining() > 20) {
        // TODO: extension parsing NOT tested
        info.extensions = [];
        var extension = {};
        info.extensions.push(extension);
        extension.signature = br.readSignature();
        extension.size = br.readUInt32BE();
        extension.data = br.slice(extension.size).toString('hex');
      }

      if (br.remaining() == 20) {
        info.checksum = {
          sha1: br.slice(20).toString('hex')
        };
      } else {
        throw new Error("Parsing error");
      }
      console.log("--");

      return done(null, info);
    });
  }


  parseIndex(".git/index", function(err, info) {
    if (err) {
      console.log("ERR:", err);
    } else {
      console.log(info);
    }
  });
}());
