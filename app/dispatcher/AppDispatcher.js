(function() {

  "use strict";


  var AppConstants = require('../constants/AppConstants');
  var Dispatcher = require('./Dispatcher');
  var util = require('util');

  var PayloadSources = AppConstants.PayloadSources;

  function ChatAppDispatcher() {
    Dispatcher.call(this);
  }

  util.inherits(ChatAppDispatcher, Dispatcher);

  /**
   * @param {object} action The details of the action, including the action's
   * type and additional data coming from the server.
   */
  ChatAppDispatcher.prototype.handleServerAction = function(action) {
    var payload = {
      source: PayloadSources.SERVER_ACTION,
      action: action
    };
    this.dispatch(payload);
  };

  /**
   * @param {object} action The details of the action, including the action's
   * type and additional data coming from the view.
   */
  ChatAppDispatcher.prototype.handleViewAction = function(action) {
    var payload = {
      source: PayloadSources.VIEW_ACTION,
      action: action
    };
    this.dispatch(payload);
  };


  module.exports = new ChatAppDispatcher();

})();