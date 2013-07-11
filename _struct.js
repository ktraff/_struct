//     _struct.js 0.0.1
//     http://structjs.org
//     (c) 2013 Kyle Traff
//     _struct may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Defining helper functions.

  // Underscore struct
  // -----------------
  var struct = root._struct = {
    VERSION: '0.0.1'
  };

  // Underscore List
  // ---------------
  var list = root._list = {
    VERSION: struct.VERSION
  };

  // Exporting

  // CommonJS module is defined
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      module.exports = _s;

    exports._s = _s;
  }

  // Add all _struct objects to the Underscore library
  _.each(['struct', 'list'], function (name) {
    _.mixin(name);
  });

}).call(this);