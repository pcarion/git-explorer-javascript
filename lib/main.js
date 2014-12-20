(function() {
  "use strict";

  var baseDirectory = ".";
  var gitDirectory = "./.git";

  var readline = require('readline');
  var exec = require('child_process').exec;
  var fs = require('fs');
  var path = require('path');
  var internalCommand = require('./internal_command');
  var fileDiffs = require('./file_diffs')(baseDirectory);
  var GitIndexDiffs = require("./git_index_diffs");
  var log = require('./log_output')("log");

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  var gitIndexDiffs;

  // we ignore a couple of files
  // and directories
  fileDiffs.ignoreFile("./log.txt");
  fileDiffs.ignoreDir("./log");
  fileDiffs.ignoreDir("./node_modules");

  fileDiffs.init(function(err) {
    if (err) {
      console.log("** can't initialize file diffs");
      process.exit(1);
    }

    rl.setPrompt(">A> ");
    rl.prompt();

    rl.on('line', function(cmd) {
      var command;
      var cmd = cmd.trim();

      if (cmd.length > 0) {
        log.command(cmd);
        if (cmd.charAt(0) == '@') {
          command = parseCmd(cmd.substring(1));
          internalCommand.exec(command, rl, log);
          handleDiffs(function() {
            rl.prompt();
          });
        } else if ((cmd === "exit") || (cmd === "quit")) {
          log.close();
          console.log("bye!\n");
          rl.close();
        } else {
          var child = exec(cmd,
            function(error, stdout, stderr) {
              log.output(stdout);
              console.log("" + stdout);

              if (stderr.size > 0) {
                console.log('stderr: ' + stderr);
                log.err(stderr);
              }
              if (error !== null) {
                console.log('exec error: ' + error);
                log.err("Error running:" + cmd + ":" + error);
              }
              handleDiffs(function(err) {
                if (err) {
                  console.log("Err:" + err);
                }
                rl.prompt();
              });
            });
        }
      }
    });
  });

  function outputFileDiffs(diffs) {
    if (diffs.modified.length > 0) {
      console.log("modified:");
      diffs.modified.forEach(function(element, index, array) {
        console.log(element);
      });
    }

    if (diffs.added.length > 0) {
      console.log("added   :");
      diffs.added.forEach(function(element, index, array) {
        console.log(element);
      });
    }

    if (diffs.deleted.length > 0) {
      console.log("deleted :");
      diffs.deleted.forEach(function(element, index, array) {
        console.log(element);
      });
    }

  }

  function outputIndexDiffs(diffs) {
    if (diffs.modified.length > 0) {
      console.log("index modified:");
      diffs.modified.forEach(function(element, index, array) {
        console.log(element);
      });
    }

    if (diffs.added.length > 0) {
      console.log("index added   :");
      diffs.added.forEach(function(element, index, array) {
        console.log(element);
      });
    }

    if (diffs.deleted.length > 0) {
      console.log("index deleted :");
      diffs.deleted.forEach(function(element, index, array) {
        console.log(element);
      });
    }
  }

  function isAdded(diffs, file) {
    for(var i = 0; i < diffs.added.length; i++) {
      if (diffs.added[i] === file) {
        return true;
      }
    }
    return false;
  }

  function isModified(diffs, file) {
    for(var i = 0; i < diffs.modified.length; i++) {
      if (diffs.modified[i] === file) {
        return true;
      }
    }
    return false;
  }

  function handleDiffs(done) {
    fileDiffs.diffs(function(err, diffs) {

      if (err) {
        return done(err);
      }

      outputFileDiffs(diffs);
      log.Filediffs(diffs);

      if (isAdded(diffs,".git/index")) {
        GitIndexDiffs(gitDirectory, function(err, result) {
          if (err) {
            return done(err);
          } else {
            gitIndexDiffs = result;
            return done();
          }
        });
      } else {
        if (isModified(diffs,".git/index")) {
          gitIndexDiffs.diffs(function(err, diffs) {
            if (err) {
              return done(err);
            }
            outputIndexDiffs(diffs);
            return done();
          });
        } else {
          return done();
        }
      }
    });
  }

  function isGitIndex(name) {
    if (path.basename(name) !== "index") {
      return false;
    }

    var dirName = path.dirname(name);
    if (path.basename(dirName) !== ".git") {
      return false;
    }

    return true;
  }

  function parseCmd(cmd) {
    var split = cmd.split(" ");
    var result = {
      command: undefined,
      args: []
    }

    for (var i = 0; i < split.length; i++) {
      var c = split[i].trim();
      if (c.length > 0) {
        if (result.command) {
          result.args.push(c);
        } else {
          result.command = c;
        }
      }
    }
    return result;
  }


}());