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

    // Creates a new list object.
    initialize: function (arr) {
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
    each: function (iterator, context) {
      var i = 0;
      var list = this.struct;
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

    // Retrieves an element from the list, if it exists.  
    find: function (obj, iterator, context) {
      var result;
      var list = this.struct;
      // If no iterator is given, simply check equality with the given obj
      iterator = iterator || function (val, idx, list) {
        return obj == val;
      };
      this.each(function (obj, idx, list) {
        if (iterator.call(context, obj, idx, list)) {
          result = obj;
          return breaker;
        }
      }, context);
      return result;
    },

    isEmpty: function (arr) {
      return this.struct === null;
    }
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