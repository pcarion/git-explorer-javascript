(function() {
  var Reflux = require('reflux');
  var Actions = require('../actions/Actions');
  var React = require('react');
  var commandStore = require('../stores/CommandStore');
  var fileSystemStore = require('../stores/FileSystemStore');


  var ENTER_KEY_CODE = 13;

  var InputCommand = React.createClass({
    mixins: [Reflux.listenTo(commandStore, "onCommandStoreResult"),Reflux.listenTo(fileSystemStore, "onFileSystemChange")],

    getInitialState: function() {
      return {
        text: '',
        result: ''
      };
    },


    render: function() {
      return ( <div>
        <textarea className = "message-composer"
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
        <br/>
        <textarea className = "tbd" name="result" value= { this.state.result}/> 
        </div>
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
          text: '',
          result: ''
        });
      }
    },

    onCommandStoreResult: function(result) {
      this.setState({
        result: result.stdout.join("\n")
      });
    },

    onFileSystemChange: function(result) {
      console.log("@@ onFileSystemChange:", result);
    }

  });

  module.exports = InputCommand;
})();