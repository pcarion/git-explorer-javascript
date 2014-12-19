(function() {
  "use strict";

  /*
   * First Character of the lines indicates the familty the log belongs to:
   * C: command issues 
   * F: files changes on the file system
   * X: admin messages
   */

  var fs = require("fs");
  var moment = require("moment");
  var path = require("path");

  var file;

  function LogOutput(dirName) {
    if (! fs.existsSync(dirName)) {
      fs.mkdirSync(dirName);
    }

    var fileName = path.join(dirName,"log-"+moment().format('YYYY-MM-DD-hhmmss')+".txt");

    file = fs.createWriteStream(fileName);
  }




  LogOutput.prototype.command = function(cmd) {
    file.write("C:-:");
    file.write(cmd);
    file.write("\n");
  }

  LogOutput.prototype.output = function(data) {
    var lines = data.toString("utf-8").split("\n");
    for (var i in lines) {
      file.write("C:O:");
      file.write(lines[i]);
      file.write("\n");
    }
  }

  LogOutput.prototype.err = function(data) {
    var lines = data.toString("utf-8").split("\n");
    for (var i in lines) {
      file.write("C:E:");
      file.write(lines[i]);
      file.write("\n");
    }
  }

  LogOutput.prototype.diffs = function(diffs) {
      if (diffs.modified.length > 0) {
        diffs.modified.forEach(function(element, index, array) {
          file.write("F:*:")
          file.write(element);
          file.write("\n");
        });
      }

      if (diffs.added.length > 0) {
        diffs.added.forEach(function(element, index, array) {
          file.write("F:+:")
          file.write(element);
          file.write("\n");
        });
      }

      if (diffs.deleted.length > 0) {
        diffs.deleted.forEach(function(element, index, array) {
          file.write("F:-:")
          file.write(element);
          file.write("\n");
        });
      }

  }

  LogOutput.prototype.close = function() {
    file.write("X:-:End");
    file.end();
  }

  module.exports = function(fileName) {
    return new LogOutput(fileName);
  }
}());