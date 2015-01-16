(function() {
  var CommandAction = require('../actions/CommandAction');
  var React = require('react');

  var ENTER_KEY_CODE = 13;

  var InputCommand = React.createClass({

    getInitialState: function() {
      return {
        text: ''
      };
    },


    render: function() {
      return ( <textarea className = "message-composer"
        name = "message"
        value = {
          this.state.text
        }
        onChange = {
          this._onChange
        }
        onKeyDown = {
          this._onKeyDown
        }
        />
      );
    },

    _onChange: function(event, value) {
      this.setState({
        text: event.target.value
      });
    },

    _onKeyDown: function(event) {
      if (event.keyCode === ENTER_KEY_CODE) {
        event.preventDefault();
        var text = this.state.text.trim();
        if (text) {
          CommandAction.newCommand(text);
        }
        this.setState({
          text: ''
        });
      }
    }

  });

  module.exports = InputCommand;
})();