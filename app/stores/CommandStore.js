(function() {
  var AppDispatcher = require('../dispatcher/AppDispatcher');
  var EventEmitter = require('events').EventEmitter;
  var AppConstants = require('../constants/AppConstants');
  var util = require('util');

  var CHANGE_EVENT = 'change';

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
  AppDispatcher.register(function(action) {
    console.log("@@@ CommandStore: ", action)
  });

  module.exports = new CommandStore();
})();