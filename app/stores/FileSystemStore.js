(function() {
  "use strict";
  var Reflux = require('reflux');
  var commandStore = require('./CommandStore');

  var fs = require('fs');
  var path = require('path');
  var buf_util = require("../lib/buffer_util");


  // Creates a DataStore
  module.exports = Reflux.createStore({
    _currentDirectory: undefined,
    _ignore_files: [],
    _ignore_dirs: [],

    _files: {
      previous: undefined,
      current: undefined
    },

    // Initial setup
    init: function() {
      var self = this;
      this._currentDirectory = ".";

      // Register statusUpdate action
      this.listenTo(commandStore, this.onCommandStoreResult);

      // we initialize the store with the current state of the directory
      walkDirectory(this._currentDirectory, this._ignore_files, this._ignore_dirs, function(err, results) {
        if (err) {
          return self.trigger({
            error: err
          });
        }
        self._files.previous = results;
      });
    },


    onCommandStoreResult: function() {
      var self = this;
      // once a command is ran, we check if new files have been created
      walkDirectory(this._currentDirectory, this._ignore_files, this._ignore_dirs, function(err, results) {
        if (err) {
          return self.trigger({
            error: err
          });
        }
        self._files.current = results;

        var diffs = showDiffs(self._files.previous, self._files.current);
        self._files.previous = self._files.current;

        return self.trigger({
          error: null,
          diffs: diffs
        });
      });

    },

    ignoreFile: function(fileName) {
      this._ignore_files.push(fileName);
    },

    ignoreDir: function(dirName) {
      this._ignore_dirs.push(dirName);
    }

  });

  function walkDirectory(directory, ignoreFiles, ignoreDirs, done) {

    walk(directory, directory, ignoreFiles, ignoreDirs, function(err, listOfFiles) {
      if (err) {
        return done(err);
      } else {
        signFiles(listOfFiles, function(err, files) {
          return done(err, files);
        });
      }
    });
  }

  function walk(dir, baseDirectory, ignore_files, ignore_dirs, done) {
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
            if (ignore_dirs.indexOf(file) < 0) {
              walk(file, baseDirectory, ignore_files, ignore_dirs, function(err, res) {
                results = results.concat(res);
                next();
              });
            } else {
              next();
            }
          } else {
            if (ignore_files.indexOf(file) < 0) {
                results.push(path.relative(baseDirectory, file));
            }
            next();
          }
        });
      })();
    });
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

  function showDiffs(previous, current) {
    var result = {
      added: [],
      deleted: [],
      modified: [],
      same: []
    };

    var file;

    for (file in previous) {
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

    for (file in current) {
      if (current.hasOwnProperty(file)) {
        if (!previous[file]) {
          result.added.push(file);
        }
      }
    }
    return result;
  }


})();