(function() {
  var Reflux = require('reflux');
  var Actions = require('../actions/Actions');
  var exec = require('child_process').exec;

  var CHANGE_EVENT = 'change';


  // Creates a DataStore
  module.exports = Reflux.createStore({

    // Initial setup
    init: function() {

      // Register statusUpdate action
      this.listenTo(Actions.commandNew, this.commandNew);
    },

    // Callback
    commandNew: function(action) {
      var cmd = action.cmd;
      console.log("execute command:", cmd);
      var self = this;

      var result = {};

      var child = exec(cmd,
        function(error, stdout, stderr) {
          result.error = error;

          if (stdout.length > 0) {
            result.stdout = stdout.toString("utf8").split(/\r?\n/);
          } else {
            result.stdout = [];
          }
          if (stderr.length > 0) {
            result.stderr = stderr.toString("utf8").split(/\r?\n/);
          } else {
            result.stderr = [];
          }
          self.trigger(result);
        });
    }

  });

})();