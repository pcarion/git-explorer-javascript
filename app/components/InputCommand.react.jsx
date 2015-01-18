(function() {
  "use strict";
  var Reflux = require('reflux');
  var Actions = require('../actions/Actions');
  var React = require('react');
  var commandStore = require('../stores/CommandStore');
  var fileSystemStore = require('../stores/FileSystemStore');


  var ENTER_KEY_CODE = 13;

  var InputCommand = React.createClass({
    mixins: [Reflux.listenTo(commandStore, "onCommandStoreResult"), Reflux.listenTo(fileSystemStore, "onFileSystemChange")],

    getInitialState: function() {
      return {
        text: '',
        error: '',
        result: ''
      };
    },


    _onChange: function(event) {
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
        text: '',
        error: result.stderr.join("\n"),
        result: result.stdout.join("\n")
      });
    },

    onFileSystemChange: function(result) {
      console.log("@@ onFileSystemChange:", result);
    },

    render: function() {
      var error ;

      if (this.state.error.trim().length > 0) {
        error = (
            <div className="alert alert-danger" role="alert">
              <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
              <span className="sr-only">Error:</span>
              { this.state.error }
            </div>          
          );
      } else {
        error = <div/>
      }
      /* jshint ignore:start */
      return ( 
        <div>
          <div className="input-group">
            <span className="input-group-addon" 
                         id="basic-addon1">
              <span className="glyphicon glyphicon-bullhorn" aria-hidden="true"></span>
            </span>
            <input type="text" 
              className="form-control" 
            placeholder="command" 
                  value={ this.state.text }
               onChange={ this._onChange }
              onKeyDown={ this._onKeyDown }
       aria-describedby="basic-addon1"/>
          </div>
          { error }
          <div className="input-group">
            <span className="input-group-addon" 
                         id="sizing-addon3">
              <span className="glyphicon glyphicon-film" aria-hidden="true"></span>
            </span>
            <textarea className="form-control ge-result" 
               aria-describedby="sizing-addon3"
                           rows="5"
                       readOnly="true"
                          value={ this.state.result }/>
          </div>

        </div>
      );
      /* jshint ignore:end */
    }


  });

  module.exports = InputCommand;
})();