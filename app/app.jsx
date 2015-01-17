(function() {
  "use strict";

  var React = require('react');
  var fileSystemStore = require('./stores/FileSystemStore');

  var InputCommand = require('./components/InputCommand.react.jsx');

  fileSystemStore.ignoreFile("./log.txt");
  fileSystemStore.ignoreDir("./bin");
  fileSystemStore.ignoreDir("./log");
  fileSystemStore.ignoreDir("./node_modules");
  fileSystemStore.ignoreDir("./app/node_modules");
  fileSystemStore.ignoreDir("./devtools");

  var App = React.createClass({
    render: function() {
      return ( 
        <InputCommand>
        Hello from App
        </InputCommand>
      );
    }
  });

  module.exports = App;

})();