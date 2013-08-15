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

  // Create a safe reference to the Underscore object for use below.
  var _struct = function(obj) {
    if (obj instanceof _struct) return obj;
    if (!(this instanceof _struct)) return new _struct(obj);
    this._wrapped = obj;
  };

  // Export the Underscore _struct object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_struct` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _struct;
    }
    exports._struct = _struct;
  } else {
    root._struct = _struct;
  }

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
  structs.list = _struct.list = function () {

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
      var struct = _.extend({ rest: null }, this.struct, { first: value });
      return _.list(struct);
    };

    return List;

  }();

  // Underscore Zipper
  // -----------------
  structs.zipper = _struct.zipper = function () {

    Zipper.prototype.VERSION = VERSION;

    // Creates a new zipper object.
    function Zipper(obj) {
      if (_.isArray(obj))
        this.struct = _.reduceRight(obj, function (zipper, obj, idx, arr) {
          return this._cons(zipper, obj, null);
        }, null, this);
      else if (isStrictObject(obj))
        this.struct = obj;
      else
        this.struct = null;
    }

    // Constructs a zipper element at the beginning of a zipper, which consists of:
    // 1) A path back to the front of the zipper, 
    // 2) The current element, and
    // 3) The rest of the zipper.
    Zipper.prototype._cons = function (zipper, obj, path) {
      var elem = { path: path || null, curr: obj, rest: zipper };
      if (zipper) zipper.path = elem;
      return elem;
    };

    // Exports a zipper instance for use in an **Underscore.js** mixin.
    Zipper.prototype._exports = function () {
      return {
        zipper: function (obj) {
          return new Zipper(obj);
        }
      };
    };

    // Moves to the first element of the zipper.
    Zipper.prototype.head  = function () {
      var struct = this.struct;
      while (struct !== null && struct.path !== null)
        struct = struct.path;
      return _.zipper(struct);
    };

    // Returns the zipper with the last element removed.
    Zipper.prototype.init = function () {
        var head = this.head();
        var struct = head.struct;
        while (struct !== null && struct.rest !== null)
          struct = struct.rest;
        if (struct && struct.path) struct.path.rest = null;
        return _.zipper(head.struct);
    };

    // Inserts an element directly left of the current element.
    Zipper.prototype.insertLeft = function (obj) {
      var struct = { path: this.struct ? this.struct.path : this.struct, curr: obj, rest: this.struct };
      return _.zipper(struct);
    },

    // Inserts an element directly right of the current element.
    Zipper.prototype.insertRight = function (obj) {
      var struct;
      if (this.struct.rest)
        struct = { path: this.struct, curr: obj, rest: this.struct.rest.rest };
      else
        struct = { path: this.struct, curr: obj, rest: null };
      return _.zipper(struct);
    },

    // Moves to the last element of the zipper.
    Zipper.prototype.last  = function () {
      var struct = this.struct;
      while (struct !== null && struct.rest !== null)
        struct = struct.rest;
      return _.zipper(struct);
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

    // Removes the current element from the zipper. If a path to the element
    // exists, points the path to the rest of the zipper.  If no elements 
    // exist after the current elem, points the current element to the previous
    // element in the path.
    Zipper.prototype.remove = function (obj) {
      var struct = this._cons(null, null);
      if (this.struct) {
        if (this.struct.path) {
          struct.path = this._cons(struct, this.struct.path.curr, this.struct.path.path);
          struct.path.rest = struct;
        }
        if (this.struct.rest) {
          struct.curr = this.struct.rest.curr;
          struct.rest = this._cons(this.struct.rest.rest, this.struct.rest.curr, struct);
          struct.rest.path = struct;
        } else if (this.struct.path) {
          struct.path = this.struct.path.path;
          struct.curr = this.struct.path.curr;
        }
      }
      return _.zipper(struct);
    },

    // Moves the cursor right. If a num is provided, moves num places
    // to the right of the cursor.
    Zipper.prototype.right = function (num) {
      var struct = this.struct;
      num = isNaN(num) ? 1 : Math.max(num, 1);
      while (num-- > 0 && struct !== null)
        struct = struct ? struct.rest : struct;
      return _.zipper(struct);
    };

    // Returns the tail of the zipper, which includes all elements except
    // the first element in the zipper.
    Zipper.prototype.tail = function () {
        return _.zipper(this.head().right().struct);
    };

    // Returns the value of the current element in the zipper. If a
    // value is provided, update the value of the current element.
    Zipper.prototype.val = function (value) {
      if (!arguments.length)
        return this.struct ? this.struct.curr : this.struct;
      var struct = _.extend({ path: null, rest: null }, this.struct, { curr: value });
      return _.zipper(struct);
    };

    return Zipper;

  }();

  // Underscore Monad
  // ----------------
  // Monads provide a way to nest functions of a similar kind in the same container,
  // acting as a functional pipeline, where data can be processed in steps. They
  // require a type constructor, as well as a `bind()` and `pipeline()` operation.
  structs.monad = _struct.monad = function () {

    Monad.prototype.VERSION = VERSION;

    // Creates a monad object.
    function Monad(_cons, bind, pipeline) {
      this._cons = _cons;
      this.bind = bind;
      this.pipeline = pipeline;
    }

    // Exports a monad instance for use in an **Underscore.js** mixin.
    Monad.prototype._exports = function () {
      return {
        monad: function (_cons, bind, pipeline) {
          return new Monad(_cons, bind, pipeline);
        }
      };
    };

    // Runs a pipeline of functions defined by the Monad constructor.
    Monad.prototype.process = function (obj, fns) {
      return this.pipeline(this._cons(obj), fns);
    };

    return Monad;

  }();

  // The dequelette below is basically a limited kind of deque, in which there can
  // only store one, two, three or four items.  It is used to build a `deque` that
  // will serve as the structure underlying a finger tree.
  _struct.fdequelette = function () {

    Dequelette.prototype.VERSION = VERSION;

    // The constructor creates a Dequelette of a specific type depending on 
    // the number of elements provided. A single-element array creates a `One`
    // dequelette, two-element array creates a `Two` dequelette, etc...
    function Dequelette(arr) {
      if (_.isArray(arr) && arr.length > 1) {
        if (arr.length === 1)
          return new One(arr);
        else if (arr.length === 2)
          return new Two(arr[0], arr[1]);
        else if (arr.length === 3)
          return new Three(arr[0], arr[1], arr[2]);
        else if (arr.length === 4)
          return new Four(arr[0], arr[1], arr[2], arr[3]);
      }
      else if (arr) {
        return new One(arr);
      }
    }

    // A dequelette with one object.
    var One = function () {

      SingleDequelette.prototype.VERSION = VERSION;

      SingleDequelette.prototype.TYPE = 'one';

      function SingleDequelette(obj) {
        this.struct = [obj];
      }

      SingleDequelette.prototype.size = function () {
        return 1;
      };

      SingleDequelette.prototype.peekLeft =
      SingleDequelette.prototype.peekRight = function () {
        return this.val();
      };

      SingleDequelette.prototype.insertLeft = function (obj) {
        return new Two(obj, this.struct);
      };

      SingleDequelette.prototype.insertRight = function (obj) {
        return new Two(this.struct, obj);
      };

      // This should never happen.
      SingleDequelette.prototype.removeLeft = function () {
        return this;
      };

      // This should never happen.
      SingleDequelette.prototype.removeRight = function () {
        return this;
      };

      SingleDequelette.prototype.val = function () {
        return this.struct[0];
      };

      return SingleDequelette;

    }();

    // A dequelette with two objects.
    var Two = function () {

      DoubleDequelette.prototype.VERSION = VERSION;

      DoubleDequelette.prototype.TYPE = 'two';

      function DoubleDequelette(obj1, obj2) {
        this.struct = [obj1, obj2];
      }

      DoubleDequelette.prototype.size = function () {
        return 2;
      };

      DoubleDequelette.prototype.peekLeft = function () {
        return this.struct[0];
      };

      DoubleDequelette.prototype.peekRight = function () {
        return this.struct[1];
      };

      DoubleDequelette.prototype.insertLeft = function (obj) {
        return new Three(obj, this.struct[0], this.struct[1]);
      };

      DoubleDequelette.prototype.insertRight = function (obj) {
        return new Three(this.struct[0], this.struct[1], obj);
      };

      DoubleDequelette.prototype.removeLeft = function () {
        return new One(this.struct[1]);
      };

      DoubleDequelette.prototype.removeRight = function () {
        return new One(this.struct[0]);
      };

      DoubleDequelette.prototype.val = function () {
        return this.struct;
      };

      return DoubleDequelette;

    }();

    // A dequelette with three objects.
    var Three = function () {

      TripleDequelette.prototype.VERSION = VERSION;

      TripleDequelette.prototype.TYPE = 'three';

      function TripleDequelette(obj1, obj2, obj3) {
        this.struct = [obj1, obj2, obj3];
      }

      TripleDequelette.prototype.size = function () {
        return 3;
      };

      TripleDequelette.prototype.peekLeft = function () {
        return this.struct[0];
      };

      TripleDequelette.prototype.peekRight = function () {
        return this.struct[2];
      };

      TripleDequelette.prototype.insertLeft = function (obj) {
        return new Four(obj, this.struct[0], this.struct[1], this.struct[2]);
      };

      TripleDequelette.prototype.insertRight = function (obj) {
        return new Four(this.struct[0], this.struct[1], this.struct[2], obj);
      };

      TripleDequelette.prototype.removeLeft = function () {
        return new Two(this.struct[1], this.struct[2]);
      };

      TripleDequelette.prototype.removeRight = function () {
        return new Two(this.struct[0], this.struct[1]);
      };

      TripleDequelette.prototype.val = function () {
        return this.struct;
      };

      return TripleDequelette;

    }();

    // A dequelette with four objects.
    var Four = function () {

      QuatrupleDequelette.prototype.VERSION = VERSION;

      QuatrupleDequelette.prototype.TYPE = 'four';

      function QuatrupleDequelette(obj1, obj2, obj3, obj4) {
        this.struct = [obj1, obj2, obj3, obj4];
      }

      QuatrupleDequelette.prototype.size = function () {
        return 4;
      };

      QuatrupleDequelette.prototype.peekLeft = function () {
        return this.struct[0];
      };

      QuatrupleDequelette.prototype.peekRight = function () {
        return this.struct[3];
      };

      // This should never happen.
      QuatrupleDequelette.prototype.insertLeft = function (obj) {
        return this;
      };

      // This should never happen.
      QuatrupleDequelette.prototype.insertRight = function (obj) {
        return this;
      };

      QuatrupleDequelette.prototype.removeLeft = function () {
        return new Three(this.struct[1], this.struct[2], this.struct[3]);
      };

      QuatrupleDequelette.prototype.removeRight = function () {
        return new Three(this.struct[0], this.struct[1], this.struct[2]);
      };

      QuatrupleDequelette.prototype.val = function () {
        return this.struct;
      };

      return QuatrupleDequelette;

    }();

    return Dequelette;

  }();

  // The `deque` below is based on an [article by Eric Lippert](http://blogs.msdn.com/b/ericlippert/archive/2008/02/12/immutability-in-c-part-eleven-a-working-double-ended-queue.aspx)
  // and is used by a finger tree as a base structure upon which the tree is built.
  // It can be one of three things:
  // - empty
  // - a single element of a particular type T
  // - a left dequelette of T, followed by a middle deque of dequelettes of T, followed by a right dequelette of T.
  _struct.fdeque = function () {

  }();

  // Underscore Finger Tree
  // ----------------------
  // A finger tree is essentially the swiss army knife of functional data structures.
  // It provides a general-purpose simple and efficient way for "accessing and removing elements 
  // at both ends, concatenatation, insertion and deletion at arbitrary points, finding an element
  // satisfying some criterion, and splitting the sequence into subsequences based on some property."
  structs.fingertree = _struct.fingertree = function () {

    FingerTree.prototype.VERSION = VERSION;

    // Creates a finger tree object.
    function FingerTree() {
    }

    // Exports a finger tree instance for use in an **Underscore.js** mixin.
    FingerTree.prototype._exports = function () {
      return {
        fingertree: function () {
          return new FingerTree();
        }
      };
    };

    return FingerTree;

  }();

  // Mix-in a function to mix-in a hash of structs to the **Underscore.js** library.
  // This can be used to add your own custom structs to the library.
  _.mixin({
    struct: function (structs) {
      _.each(structs, function (struct, key) {
        _.mixin(new struct()._exports());
      });
    }
  });

  // Add all struct objects to the **Underscore.js** library.
  _.struct(structs);

}).call(this);