(function() {
  "use strict";

  var React = require('react');
  var InputCommand = require('./components/InputCommand.react.jsx');

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