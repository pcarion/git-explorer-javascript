(function() {
  "use strict";

  var Reflux = require('reflux');

  var Actions = Reflux.createActions([
    "commandNew",
    "statusEdited",
    "statusAdded"
  ]);

  module.exports = Actions;
})();