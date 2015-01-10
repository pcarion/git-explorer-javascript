(function() {
  "use strict";
  // check: http://nodejs.org/api/globals.html#globals_require_extensions
  // deperacted , so we may need to get rid of node-jsx
  require('node-jsx').install({
    extension: '.jsx'
  });
  var React = require('react');
  var App = React.createFactory(require('./app.jsx'));

  React.render(App(), document.getElementById('app'));
})();