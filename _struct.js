//     _struct.js 0.0.1
//     http://structjs.org
//     (c) 2013 Kyle Traff
//     _struct may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Defining helper functions.

  // Export a module for **Node.js**.
  var nodeExports = function (name, obj) {
    if (typeof exports !== 'undefined') {
      if (typeof module !== 'undefined' && module.exports)
        module.exports[name] = obj;

      exports[name] = obj;
    }
  };

  // Exports attributes of a struct for use as an **Underscore** mixin.
  var exports = function (options) {
    options = _.extend({
      // Define a filter function to remove unwanted or private struct attributes.
      filter: _.bind(function (prop) {
        return !this.hasOwnProperty(prop) || prop[0] === '_';
      }, this)
    }, options);
    var struct = {};
    for (var prop in this) {
      if (options.filter(prop)) continue;
      struct[prop] = this[prop];
    }
    return struct;
  };

  var VERSION = '0.0.1';

  // Underscore List
  // ---------------
  var list = {
    VERSION: VERSION,

    initialize: function (arr) {
      // TODO memoize the struct
      if (_.isArray(arr)) {
        this.struct = _.reduceRight(arr, this.cons, null, this);
      } else {
        this.struct = this.cons(null, {});
      }
      return this;
    },

    // Constructs a list element by placing the obj at the head of the list.
    cons: function (list, obj) {
      return { first: obj, rest: list };
    },

    // A modified version of _.each made for traversing lists.
    each: function (list, iterator, context) {
      var i = 0;
      while (list !== null) {
        if (iterator.call(context, list.first, i++, list) === breaker) return;
        list = list.rest;
      }
    },

    // Exports a list instance for use in an **Underscore.js** mixin.
    exports: function () {
      var listObj = exports.call(this);
      return {
        list: _.bind(listObj.initialize, listObj)
      };
    },

    // A modified version of _.each made for traversing lists.
    find: function (list, iterator, context) {
      var result;
      iterator || (iterator = _.identity);
      this.each(list, function (obj, idx, list) {
        if (iterator.call(context, obj, idx, list)) {
          result = obj;
          return true;
        }
      }, context);
      return result;
    },

    isEmpty: _.isEmpty
  };

  var structs = {
    list: list
  };
  // Add all struct objects to the Underscore library
  _.each(structs, function (struct, key) {
    _.mixin(struct.exports());
    nodeExports(key, struct);
  });

}).call(this);