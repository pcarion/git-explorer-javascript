(function() {
  var Reflux = require('reflux');
  var Actions = require('../actions/Actions');
  var React = require('react');
  var CommandStore = require('../stores/CommandStore');

  var ENTER_KEY_CODE = 13;

  var InputCommand = React.createClass({
    mixins: [Reflux.listenTo(CommandStore,"onCommandStoreResult")],

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
          Actions.commandNew({
            cmd: text
          });
        }
        this.setState({
          text: ''
        });
      }
    },

    onCommandStoreResult: function(result) {
      console.log("Result:", result);
    }

  });

  module.exports = InputCommand;
})();