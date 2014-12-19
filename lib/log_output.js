(function() {
  "use strict";

  var fs = require("fs");
  var file;

  function LogOutput(fileName) {
    file = fs.createWriteStream(fileName);
  }

  LogOutput.prototype.command = function(cmd) {
    file.write("C:");
    file.write(cmd);
    file.write("\n");
  }

  LogOutput.prototype.output = function(data) {
    var lines = data.toString("utf-8").split("\n");
    for (var i in lines) {
      file.write("O:");
      file.write(lines[i]);
      file.write("\n");
    }
  }

  LogOutput.prototype.err = function(data) {
    var lines = data.toString("utf-8").split("\n");
    for (var i in lines) {
      file.write("E:");
      file.write(lines[i]);
      file.write("\n");
    }
  }

  LogOutput.prototype.diffs = function(diffs) {
      if (diffs.modified.length > 0) {
        diffs.modified.forEach(function(element, index, array) {
          file.write("*:")
          file.write(element);
          file.write("\n");
        });
      }

      if (diffs.added.length > 0) {
        diffs.added.forEach(function(element, index, array) {
          file.write("+:")
          file.write(element);
          file.write("\n");
        });
      }

      if (diffs.deleted.length > 0) {
        diffs.deleted.forEach(function(element, index, array) {
          file.write("-:")
          file.write(element);
          file.write("\n");
        });
      }

  }

  LogOutput.prototype.close = function() {
    file.write("X:--");
    file.end();
  }

  module.exports = function(fileName) {
    return new LogOutput(fileName);
  }
}());