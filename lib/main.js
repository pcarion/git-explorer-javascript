(function() {
  "use strict";

  var readline = require('readline');
  var spawn = require('child_process').spawn;
  var fs = require('fs');

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.setPrompt(">A> ");
  rl.prompt();

  rl.on('line', function(cmd) {
    console.log('You just typed: ' + cmd);
    var ls = spawn("ls");

    ls.stdout.on('data', function(data) {
      console.log('stdout: ' + data);
    });

    ls.stderr.on('data', function(data) {
      console.log('stderr: ' + data);
    });

    ls.on('close', function(code) {
      console.log('child process exited with code ' + code);
      rl.prompt();
    });
  });

  // rl.question("What do you think of node.js? ", function(answer) {
  //   // TODO: Log the answer in a database
  //   console.log("Thank you for your valuable feedback:", answer);

  //   rl.close();
  // });

}());