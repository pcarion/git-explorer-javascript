(function() {
  var fs = require('fs');
  var path = require('path');
  var crypto = require('crypto');
  var buf_util = require("./buffer_util");
  var ignore_files = [];
  var ignore_dirs = [];


  var storage = {
    previous: undefined,
    current: undefined
  };

  var baseDirectory;

  function FileDiffs(directory) {
    baseDirectory = directory;
  }

  FileDiffs.prototype.ignoreFile = function(fileName) {
    ignore_files.push(fileName);
  }

  FileDiffs.prototype.ignoreDir = function(dirName) {
    ignore_dirs.push(dirName);
  }

  FileDiffs.prototype.init = function(done) {
    walkDirectory(baseDirectory, function(err, results) {
      if (err) {
        return done(err);
      }
      storage.previous = results;
      return done(null);
    });
  }


  FileDiffs.prototype.diffs = function(done) {
    walkDirectory(baseDirectory, function(err, results) {
      if (err) {
        return done(err);
      }
      storage.current = results;

      var diffs = showDiffs(storage.previous, storage.current);
      storage.previous = storage.current;
      return done(null, diffs);
    });
  }

  function walkDirectory(directory, done) {
    walk(directory, function(err, listOfFiles) {
      if (err) {
        return done(err);
      } else {
        signFiles(listOfFiles, function(err, files) {
          return done(err, files);
        });
      }
    })
  }

  function showDiffs(previous, current) {
    var result = {
      added: [],
      deleted: [],
      modified: [],
      same: []
    };

    for (var file in previous) {
      if (previous.hasOwnProperty(file)) {
        if (!current[file]) {
          result.deleted.push(file);
        } else {
          if (previous[file] === current[file]) {
            result.same.push(file);
          } else {
            result.modified.push(file);
          }
        }
      }
    }

    for (var file in current) {
      if (current.hasOwnProperty(file)) {
        if (!previous[file]) {
          result.added.push(file);
        }
      }
    }
    return result;
  }

  function signFiles(listOfFiles, done) {
    var i = 0;

    var results = {};

    (function next() {
      var file = listOfFiles[i++];

      if (!file) return done(null, results);

      buf_util.getSHA1ForFile(file, function(err, sha1) {
        if (err) {
          return done(err);
        }
        results[file] = sha1;
        next();
      });
    })();
  }

  function walk(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      var i = 0;
      (function next() {
        var file = list[i++];
        if (!file) return done(null, results);
        file = dir + '/' + file;
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            walk(file, function(err, res) {
              results = results.concat(res);
              next();
            });
          } else {
            if (ignore_files.indexOf(file) < 0) {
              var dir = path.dirname(file);
              var ignore = false;
              for (var i = 0; i < ignore_dirs.length; i++) {
                if ((file.indexOf(ignore_dirs[i])) === 0) {
                  ignore = true;
                }
              }
              if (!ignore) {
                results.push(path.relative(baseDirectory,file));
              }
            }
            next();
          }
        });
      })();
    });
  };

  module.exports = function(dirName) {
    return new FileDiffs(dirName);
  };
}());