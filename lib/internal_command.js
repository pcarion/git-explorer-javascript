(function() {
  "use strict";

  var indexParser = require("./index_parser");

  module.exports.exec = function(command, rl, log) {
    if (command.command === "ls") {
      indexParser(".git/index", function(err, result) {
        if (err) {
          console.log("ERR:"+err);
        } else {
          console.log(result);
        }
      })
    }
  }
}());