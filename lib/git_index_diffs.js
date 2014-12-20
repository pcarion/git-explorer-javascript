(function() {
  "use strict";

  var path = require('path');
  var indexParser = require("./index_parser");

  var storage = {
    previous: undefined,
    current: undefined
  };

  var indexFileName;


  function GitIndexDiff(theIndexFileName, indexContent0) {
    indexFileName = theIndexFileName;
    storage.previous = getFiles(indexContent0);
  }

  GitIndexDiff.prototype.diffs = function(done) {
    indexParser(indexFileName, function(err, result) {
      if (err) {
        return done(err);
      } else {
        storage.current = getFiles(result);

        var diffs = showDiffs(storage.previous, storage.current);
        storage.previous = storage.current;
        return done(null, diffs);
      }
    });
  };

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


  function getFiles(indexContent) {
    var result = {};
    indexContent.entries.forEach(function(element) {
      result[element.pathName] = element.sha1;
    });
    return result;
  }

  function prepareIndexFile(indexFileName, done) {
    indexParser(indexFileName, function(err, result) {
      if (err) {
        return done(err);
      } else {
        return done(null, new GitIndexDiff(indexFileName, result));
      }
    });

  }

  module.exports = function(gitDirectory, done) {
    prepareIndexFile(path.join(gitDirectory, "index"), function(err, info) {
      if (err) {
        return done(err);
      } else {
        return done(null, info);
      }
    });

  };


}());