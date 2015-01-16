(function() {
  "use strict";

  var Reflux = require('reflux');

  var Actions = Reflux.createActions([
    "commandNew",  // emitted when a new command has to be executed
    "statusEdited",
    "statusAdded"
  ]);

  module.exports = Actions;
})();