(function() {
  var fs = require('fs');
  var crypto = require('crypto');

  var storage = {
    previous: undefined,
    current: undefined
  };

  var directory = ".git";

  processDirectory(directory, function(err, diffs) {
    if (err) {
      console.log(err);
    } else {
      fs.watch(directory, function(event, filename) {
        processDirectory(directory, function(err, diffs) {
          if (err) {
            console.log(err);
          } else {
            if (diffs.modified.length > 0) {
              console.log("modified:" + diffs.modified);
            }

            if (diffs.added.length > 0) {
              console.log("added   :" + diffs.added);
            }

            if (diffs.deleted.length > 0) {
              console.log("deleted :" + diffs.deleted);
            }
          }
        });
      });
    }
  });


  function processDirectory(directory, done) {
    walk(directory, function(err, listOfFiles) {
      if (err) {
        return done(err);
      } else {
        signFiles(listOfFiles, function(err, files) {
          if (!storage.current) {
            storage.current = files;
            return done(null, null);
          } else {
            storage.previous = storage.current;
            storage.current = files;

            var diffs = showDiffs(storage.previous, storage.current);
            return done(null, diffs);
          }
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

      var shasum = crypto.createHash('sha1');

      var s = fs.ReadStream(file);
      s.on('data', function(d) {
        shasum.update(d);
      });

      s.on('end', function() {
        var d = shasum.digest('hex');
        results[file] = d;
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
            results.push(file);
            next();
          }
        });
      })();
    });
  };
}());