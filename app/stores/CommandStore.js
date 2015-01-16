(function() {
  var AppDispatcher = require('../dispatcher/AppDispatcher');
  var EventEmitter = require('events').EventEmitter;
  var AppConstants = require('../constants/AppConstants');
  var util = require('util');
  var exec = require('child_process').exec;

  var CHANGE_EVENT = 'change';


  function executeCommand(cmd) {
    console.log("execute command:" + cmd);

    var child = exec(cmd,
      function(error, stdout, stderr) {
        console.log("" + stdout);

        if (stderr.size > 0) {
          console.log('stderr: ' + stderr);
        }
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });
  }

  function CommandStore() {
    EventEmitter.call(this);
  }

  util.inherits(CommandStore, EventEmitter);


  CommandStore.prototype.emitChange = function() {
    this.emit(CHANGE_EVENT);
  };

  /**
   * @param {function} callback
   */
  CommandStore.prototype.addChangeListener = function(callback) {
    this.on(CHANGE_EVENT, callback);
  };

  CommandStore.prototype.removeChangeListener = function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  };

  // Register callback to handle all updates
  AppDispatcher.register(function(payload) {
    var action = payload.action;
    console.log("@@@ CommandStore: ", action);

    switch (action.type) {
      case AppConstants.ActionTypes.NEW_COMMAND:
        executeCommand(action.text.trim());
        break;

      default:
        // no op
    }
  });

  module.exports = new CommandStore();
})();