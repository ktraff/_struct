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
        return !this.hasOwnProperty(prop);
      }, this)
    }, options);
    var struct = {};
    for (var prop in this) {
      if (options.filter(prop)) continue;
      struct[prop] = this[prop];
    }
    return struct;
  };

  // Used to mix in custom behavior to a struct.
  var mixin = function (obj) {
    _.each(_.functions(obj), function (name) {
      this[name] = obj[name];
    }, this);
  };

  // An internal function that returns true if the given object 
  // represents an object, but not a function or array.
  var isStrictObject = function (obj) {
    return _.isObject(obj) && !_.isFunction(obj) && !_.isArray(obj);
  };

  var VERSION = '0.0.1';

  // Underscore List
  // ---------------
  var list = {

    VERSION: VERSION,

    // Creates a new list object. Pass an array of elements, a valid list struct 
    // object, or leave empty to initialize an empty list.
    initialize: function (obj) {
      if (_.isArray(obj))
        this.struct = _.reduceRight(obj, this._cons, null, this);
      else if (isStrictObject(obj))
        this.struct = obj;
      else
        this.struct = null;
      return this;
    },

    // Constructs a list element by placing the obj at the head of the list.
    _cons: function (list, obj) {
      return { first: obj, rest: list };
    },

    // Exports a list instance for use in an **Underscore.js** mixin.
    _exports: function () {
      return {
        list: _.bind(function (obj) {
          var listObj = exports.call(this);
          listObj.initialize(obj);
          return listObj;
        }, this)
      };
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

    // Retrieves an element from the list, if it exists. Return 
    // a new list with the found element, or an empty list if not found.
    find: function (token, comparator, context) {
      var result;
      var list = this.struct;
      // If no comparator is given, simply check equality with the given token.
      comparator = comparator || function (token, obj, list) {
        return token == obj;
      };
      this.each(function (obj, idx, list) {
        if (comparator.call(context, token, obj, list)) {
          result = list;
          return breaker;
        }
      }, context);
      return _.list(result);
    },

    // Returns an empty list.
    empty: function () {
      return _.list();
    },

    // Creates a new list, with the given obj inserted at the head of the list.
    insert: function (obj) {
      var struct = this._cons(this.struct, obj);
      return _.list(struct);
    },

    // Returns true if the current element is empty, and
    // there exist no pointers to other elements in the list.
    isEmpty: function (arr) {
      return this.struct === null;
    },

    // Returns the length of the list.
    length: function () {
      var count = 0;
      this.each(function (obj, idx, list) {
        if (obj === null)
          return breaker;
        ++count;
      });
      return count;
    },

    mixin: function () {
      mixin.apply(this, arguments);
    },

    // Returns a list whose head is next element in the list.
    next: function () {
      var struct = this.struct ? this.struct.rest : this.struct;
      return _.list(struct);
    },

    // Returns the current element in the list.
    val: function () {
      return this.struct ? this.struct.first : this.struct;
    }

  };

  var structs = {
    list: list
  };

  // Add all struct objects to the Underscore library
  _.each(structs, function (struct, key) {
    _.mixin(struct._exports());
    nodeExports(key, struct);
  });

}).call(this);