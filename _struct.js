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

  // Used to mix in custom behavior to a struct.
  var mixin = function (obj, proto) {
    _.each(_.functions(obj), function (name) {
      proto[name] = obj[name];
    }, this);
  };

  // An internal function that returns true if the given object 
  // represents an object, but not a function or array.
  var isStrictObject = function (obj) {
    return _.isObject(obj) && !_.isFunction(obj) && !_.isArray(obj);
  };

  // Simple equality function that returns true if the token `==`
  // the given obj.
  var equals = function (token, obj) {
    return token == obj;
  };

  // Strict form of equals function.
  var strictEquals = function (token, obj) {
    return token === obj;
  };

  // Define a container to keep track of all struct objects.
  var structs = {};

  var VERSION = '0.0.1';

  // Underscore Linked List
  // ----------------------
  structs.list = function () {

    List.prototype.VERSION = VERSION;

    // Creates a new list object. Pass an array of elements, a valid list struct 
    // object, or leave empty to initialize an empty list.
    function List(obj) {
      if (_.isArray(obj))
        this.struct = _.reduceRight(obj, this._cons, null, this);
      else if (isStrictObject(obj))
        this.struct = obj;
      else
        this.struct = null;
    }

    // Constructs a list element by placing the obj at the head of the list.
    List.prototype._cons = function (list, obj) {
      return { first: obj, rest: list };
    };

    // Exports a list instance for use in an **Underscore.js** mixin.
    List.prototype._exports = function () {
      return {
        list: function (obj) {
          return new List(obj);
        }
      };
    };

    // A modified version of _.each made for traversing lists.
    List.prototype.each = function (iterator, context) {
      var i = 0;
      var list = this.struct;
      while (list !== null) {
        if (iterator.call(context, list.first, i++, list) === breaker) return;
        list = list.rest;
      }
    };

    // Retrieves an element from the list, if it exists. Return 
    // a new list with the found element, or an empty list if not found.
    List.prototype.find = function (token, comparator, context) {
      var result;
      var list = this.struct;
      comparator = comparator || equals;
      this.each(function (obj, idx, list) {
        if (comparator.call(context, token, obj, list)) {
          result = list;
          return breaker;
        }
      }, context);
      return _.list(result);
    };

    // Returns an empty list.
    List.prototype.empty = function () {
      return _.list();
    };

    // Creates a new list, with the given obj inserted at the head of the list.
    List.prototype.insert = function (obj) {
      var struct = this._cons(this.struct, obj);
      return _.list(struct);
    };

    // Returns true if the current element is empty, and
    // there exist no pointers to other elements in the list.
    List.prototype.isEmpty = function (arr) {
      return this.struct === null;
    };

    // Returns the length of the list.
    List.prototype.length = function () {
      var count = 0;
      this.each(function (obj, idx, list) {
        if (obj === null)
          return breaker;
        ++count;
      });
      return count;
    };

    // Add your own custom functions to every list object.
    List.prototype.mixin = function (obj) {
      mixin.apply(this, [obj, List.prototype]);
    };

    // Returns a list whose head is next element in the list. If a 
    // num is provided, moves num spaces forward in the list.
    List.prototype.next = function (num) {
      var struct = this.struct;
      num = isNaN(num) ? 1 : Math.max(num, 1);
      while (num-- > 0 && struct !== null)
        struct = struct ? struct.rest : struct;
      return _.list(struct);
    };

    // Returns a list with the given token removed. If no token
    // is given, removes the current element. If no element could 
    // be found, returns the original list.
    List.prototype.remove = function (token, comparator, context) {
      if (token === null || this.struct === null)
        return this.next();
      var result;
      comparator = comparator || equals;
      if (comparator.call(context, token, this.val()))
        return this.next();
      var struct = this._cons(null, this.struct.first);
      var curr = struct;
      this.next().each(function (obj, idx, list) {
        if (comparator.call(context, token, obj, list)) {
          curr.rest = list ? list.rest : list;
          return breaker;
        } else {
          curr.rest = this._cons(null, obj);
          curr = curr.rest;
        }
      }, this);
      return _.list(struct);
    },


    // Returns the value of the current element in the zipper. If a
    // value is provided, update the value of the current element.
    List.prototype.val = function (value) {
      if (!arguments.length)
        return this.struct ? this.struct.first : this.struct;
      return _.list(this._cons(this.struct.rest, value));
    };

    return List;

  }();

  // Underscore Zipper
  // -----------------
  structs.zipper = function () {

    Zipper.prototype.VERSION = VERSION;

    // Creates a new zipper object.
    function Zipper(obj) {
      if (_.isArray(obj))
        this.struct = _.reduceRight(obj, this._cons, null, this);
      else if (isStrictObject(obj))
        this.struct = obj;
      else
        this.struct = null;
    }

    // Exports a zipper instance for use in an **Underscore.js** mixin.
    Zipper.prototype._exports = function () {
      return {
        zipper: function (obj) {
          return new Zipper(obj);
        }
      };
    };

    // Constructs a zipper element at the beginning of a zipper, which consists of:
    // 1) A path back to the front of the zipper, 
    // 2) The current element, and
    // 3) The rest of the zipper.
    Zipper.prototype._cons = function (zipper, obj) {
      var elem = { path: null, curr: obj, rest: zipper };
      if (zipper) zipper.path = elem;
      return elem;
    };

    // Moves the cursor left. If a num is provided, moves num places
    // to the left of the cursor.
    Zipper.prototype.left = function (num) {
      var struct = this.struct;
      num = isNaN(num) ? 1 : Math.max(num, 1);
      while (num-- > 0 && struct !== null)
        struct = struct ? struct.path : struct;
      return _.zipper(struct);
    },

    // Add your own custom functions to every zipper object.
    Zipper.prototype.mixin = function (obj) {
      mixin.apply(this, [obj, Zipper.prototype]);
    };

    // Moves the cursor right. If a num is provided, moves num places
    // to the right of the cursor.
    Zipper.prototype.right = function (num) {
      var struct = this.struct;
      num = isNaN(num) ? 1 : Math.max(num, 1);
      while (num-- > 0 && struct !== null)
        struct = struct ? struct.rest : struct;
      return _.zipper(struct);
    };

    // Returns the value of the current element in the zipper. If a
    // value is provided, update the value of the current element.
    Zipper.prototype.val = function (value) {
      if (!arguments.length)
        return this.struct ? this.struct.curr : this.struct;
      return _.zipper({ path: this.struct.path, curr: value, rest: this.struct.rest });
    };

    return Zipper;

  }();

  // Add all struct objects to the Underscore library.
  _.each(structs, function (struct, key) {
    _.mixin(new struct()._exports());
    nodeExports(key, struct);
  });

}).call(this);