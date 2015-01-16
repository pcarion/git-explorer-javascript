(function() {

  "use strict";

  var AppDispatcher = require('../dispatcher/AppDispatcher');
  var AppConstants = require('../constants/AppConstants');

  module.exports = {

    newCommand: function(text) {
      AppDispatcher.handleViewAction({
        type: AppConstants.ActionTypes.NEW_COMMAND,
        text: text
      });
    }

  };

})();