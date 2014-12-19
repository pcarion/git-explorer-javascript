(function() {
  "use strict";

  var readline = require('readline');
  var exec = require('child_process').exec;
  var fs = require('fs');
  var internalCommand = require('./internal_command');

  var log = require('./log_output')("log.txt");

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

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
        rl.prompt();
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
            rl.prompt();
          });
      }
    }
  });


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

  // rl.question("What do you think of node.js? ", function(answer) {
  //   // TODO: Log the answer in a database
  //   console.log("Thank you for your valuable feedback:", answer);

  //   rl.close();
  // });

}());