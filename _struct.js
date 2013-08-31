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

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

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

  // Compares two elements.
  var compareTo = function (elem1, elem2) {
    if (elem1 < elem2)
      return -1;
    else if (elem1 > elem2)
      return 1;
    return 0;
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

    // Add your own custom functions to every monad object.
    Monad.prototype.mixin = function (obj) {
      mixin.apply(this, [obj, Monad.prototype]);
    };

    return Monad;

  }();

  // The dequelette below is basically a limited kind of deque, in which there can
  // only store one, two, three or four items.  It is used to build a `deque` that
  // will serve as the structure underlying a finger tree.
  _struct.fdequelette = function () {

    Dequelette.prototype.VERSION = VERSION;

    // The constructor creates a Dequelette of a specific type depending on 
    // the number of elements provided. A single-element array creates a `one`
    // dequelette, two-element array creates a `two` dequelette, etc...
    function Dequelette(arr) {
      if (_.isArray(arr) && arr.length) {
        if (arr.length === 1)
          return new one(arr[0]);
        else if (arr.length === 2)
          return new two(arr[0], arr[1]);
        else if (arr.length === 3)
          return new three(arr[0], arr[1], arr[2]);
        else if (arr.length === 4)
          return new four(arr[0], arr[1], arr[2], arr[3]);
      }
      else if (arr)
        return new one(arr);
    }

    // A dequelette with one object.
    var one = function () {

      SingleDequelette.prototype.VERSION = VERSION;

      SingleDequelette.prototype.TYPE = 'one';

      function SingleDequelette(obj) {
        this.struct = [obj];
      }

      SingleDequelette.prototype.full = function () {
        return false;
      };

      SingleDequelette.prototype.size = function () {
        return 1;
      };

      SingleDequelette.prototype.peekLeft  =
      SingleDequelette.prototype.peekRight = function () {
        return this.val();
      };

      SingleDequelette.prototype.insertLeft = function (obj) {
        return new two(obj, this.struct[0]);
      };

      SingleDequelette.prototype.insertRight = function (obj) {
        return new two(this.struct[0], obj);
      };

      // This should never happen.
      SingleDequelette.prototype.removeLeft  =
      SingleDequelette.prototype.removeRight = function () {
        return this;
      };

      SingleDequelette.prototype.val = function () {
        return this.struct[0];
      };

      return SingleDequelette;

    }();

    // A dequelette with two objects.
    var two = function () {

      DoubleDequelette.prototype.VERSION = VERSION;

      DoubleDequelette.prototype.TYPE = 'two';

      function DoubleDequelette(obj1, obj2) {
        this.struct = [obj1, obj2];
      }

      DoubleDequelette.prototype.full = function () {
        return false;
      };

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
        return new three(obj, this.struct[0], this.struct[1]);
      };

      DoubleDequelette.prototype.insertRight = function (obj) {
        return new three(this.struct[0], this.struct[1], obj);
      };

      DoubleDequelette.prototype.removeLeft = function () {
        return new one(this.struct[1]);
      };

      DoubleDequelette.prototype.removeRight = function () {
        return new one(this.struct[0]);
      };

      DoubleDequelette.prototype.val = function () {
        return this.struct;
      };

      return DoubleDequelette;

    }();

    // A dequelette with three objects.
    var three = function () {

      TripleDequelette.prototype.VERSION = VERSION;

      TripleDequelette.prototype.TYPE = 'three';

      function TripleDequelette(obj1, obj2, obj3) {
        this.struct = [obj1, obj2, obj3];
      }

      TripleDequelette.prototype.full = function () {
        return false;
      };

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
        return new four(obj, this.struct[0], this.struct[1], this.struct[2]);
      };

      TripleDequelette.prototype.insertRight = function (obj) {
        return new four(this.struct[0], this.struct[1], this.struct[2], obj);
      };

      TripleDequelette.prototype.removeLeft = function () {
        return new two(this.struct[1], this.struct[2]);
      };

      TripleDequelette.prototype.removeRight = function () {
        return new two(this.struct[0], this.struct[1]);
      };

      TripleDequelette.prototype.val = function () {
        return this.struct;
      };

      return TripleDequelette;

    }();

    // A dequelette with four objects.
    var four = function () {

      QuatrupleDequelette.prototype.VERSION = VERSION;

      QuatrupleDequelette.prototype.TYPE = 'four';

      function QuatrupleDequelette(obj1, obj2, obj3, obj4) {
        this.struct = [obj1, obj2, obj3, obj4];
      }

      QuatrupleDequelette.prototype.full = function () {
        return true;
      };

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
      QuatrupleDequelette.prototype.insertLeft  =
      QuatrupleDequelette.prototype.insertRight = function (obj) {
        return this;
      };

      QuatrupleDequelette.prototype.removeLeft = function () {
        return new three(this.struct[1], this.struct[2], this.struct[3]);
      };

      QuatrupleDequelette.prototype.removeRight = function () {
        return new three(this.struct[0], this.struct[1], this.struct[2]);
      };

      QuatrupleDequelette.prototype.val = function () {
        return this.struct;
      };

      return QuatrupleDequelette;

    }();

    return Dequelette;

  }();

  // Underscore Finger Tree
  // ----------------------
  // A finger tree is essentially the swiss army knife of functional data structures.
  // It provides a general-purpose simple and efficient way for "accessing and removing elements 
  // at both ends, concatenatation, insertion and deletion at arbitrary points, finding an element
  // satisfying some criterion, and splitting the sequence into subsequences based on some property."
  //
  // The underyling structure is essentially a deque of "dequelettes," arranged so that you have
  // constant-time access to the "fingers" (leaves) of the tree.
  structs.fingerTree = _struct.fingerTree = function () {

    FingerTree.prototype.VERSION = VERSION;

    // The constructor creates a Deque of a specific type depending on the number and type of elements provided.
    // The `deque` used to build a finger tree is based on an [article by Eric Lippert](http://blogs.msdn.com/b/ericlippert/archive/2008/02/12/immutability-in-c-part-eleven-a-working-double-ended-queue.aspx)
    // It can be one of three things:
    // 1. empty,
    // 2. a single element of a particular type T, or
    // 3. a left dequelette of T, followed by a middle deque of dequelettes of T, followed by a right dequelette of T.
    function FingerTree(left, middle, right) {
      var isDef = [(left !== void 0), (middle !== void 0), (right !== void 0)];
      if (_.isArray(left)) {
        // An array of objects were directly passed in. Create a deque to hold them.
        this.struct = _.reduce(left, function (deque, obj) { return deque.insertRight(obj); }, new emptyDeque());
      } else if (isDef[0] && isDef[1] && isDef[2]) {
        // Assume a left dequelette, followed by a deque of dequelettes, followed by a right dequelette were passed in.
        this.struct = new deque(left, middle, right);
      } else if (isDef[0]) {
        if (left instanceof emptyDeque || left instanceof singleDeque || left instanceof deque)
          // A deque was directly passed in.
          this.struct = left;
        else
          // A single object was directly passed in. 
          this.struct = new singleDeque(left);
      } else
        this.struct = new emptyDeque();
    }

    // Exports a finger tree instance for use in an **Underscore.js** mixin.
    FingerTree.prototype._exports = function () {
      return {
        fingerTree: function (left, middle, right) {
          return new FingerTree(left, middle, right);
        }
      };
    };

    // Add your own custom functions to every finger tree object.
    FingerTree.prototype.mixin = function (obj) {
      mixin.apply(this, [obj, FingerTree.prototype]);
    };

    FingerTree.prototype.isEmpty = function () {
        return this.struct.isEmpty();
    };

    FingerTree.prototype.insertLeft = function (obj) {
      return _.fingerTree(this.struct.insertLeft(obj));
    };

    FingerTree.prototype.insertRight = function (obj) {
      return _.fingerTree(this.struct.insertRight(obj));
    };

    FingerTree.prototype.peekLeft = function () {
        return this.struct.peekLeft();
    };

    FingerTree.prototype.peekRight = function () {
        return this.struct.peekRight();
    };

    FingerTree.prototype.removeLeft = function () {
        return _.fingerTree(this.struct.removeLeft());
    };

    FingerTree.prototype.removeRight = function () {
        return _.fingerTree(this.struct.removeRight());
    };

    // A deque with no elements.
    var emptyDeque = function () {

      EmptyDeque.prototype.VERSION = VERSION;

      EmptyDeque.prototype.TYPE = 'empty';

      function EmptyDeque() {
        this.struct = null;
      }

      EmptyDeque.prototype.isEmpty = function () {
        return true;
      };

      EmptyDeque.prototype.insertLeft  =
      EmptyDeque.prototype.insertRight = function (obj) {
        return new singleDeque(obj);
      };

      EmptyDeque.prototype.peekLeft  =
      EmptyDeque.prototype.peekRight = function () {
        return this.struct;
      };

      // This should never happen.
      EmptyDeque.prototype.removeLeft  =
      EmptyDeque.prototype.removeRight = function () {
        return this;
      };

      return EmptyDeque;

    }();

    // A deque with one element.
    var singleDeque = function () {

      SingleDeque.prototype.VERSION = VERSION;

      SingleDeque.prototype.TYPE = 'single';

      function SingleDeque(obj) {
        this.struct = obj;
      }

      SingleDeque.prototype.isEmpty = function () {
        return false;
      };

      SingleDeque.prototype.insertLeft  = function (obj) {
        return new deque(new _struct.fdequelette([obj]), new emptyDeque(), _struct.fdequelette([this.struct]));
      };

      SingleDeque.prototype.insertRight = function (obj) {
        return new deque(new _struct.fdequelette([this.struct]), new emptyDeque(), _struct.fdequelette([obj]));
      };

      SingleDeque.prototype.peekLeft  =
      SingleDeque.prototype.peekRight = function () {
        return this.struct;
      };

      SingleDeque.prototype.removeLeft  =
      SingleDeque.prototype.removeRight = function () {
        return new emptyDeque();
      };

      return SingleDeque;

    }();

    // A deque with thee elements: a left dequelette, a deque of dequelettes,
    // and a right dequelette.
    var deque = function () {

      Deque.prototype.VERSION = VERSION;

      Deque.prototype.TYPE = 'deque';

      function Deque(left, middle, right) {
        this.left = left;
        this.middle = middle;
        this.right = right;
        this.struct = [left, middle, right];
      }

      Deque.prototype.isEmpty = function () {
        return false;
      };

      Deque.prototype.insertLeft  = function (obj) {
        if (!this.left.full())
          return new deque(this.left.insertLeft(obj), this.middle, this.right);
        return new deque(new _struct.fdequelette([obj, this.left.peekLeft()]),
                         this.middle.insertLeft(this.left.removeLeft()),
                         this.right);
      };

      Deque.prototype.insertRight = function (obj) {
        if (!this.right.full())
          return new deque(this.left, this.middle, this.right.insertRight(obj));
        return new deque(this.left,
                         this.middle.insertRight(this.right.removeRight()),
                         new _struct.fdequelette([this.right.peekRight(), obj]));
      };

      Deque.prototype.peekLeft  = function () {
          return this.left.peekLeft();
      };

      Deque.prototype.peekRight = function () {
        return this.right.peekRight();
      };

      Deque.prototype.removeLeft  = function () {
        if (this.left.size() > 1)
          return new deque(this.left.removeLeft(), this.middle, this.right);
        else if (!this.middle.isEmpty())
          return new deque(this.left, this.middle.removeLeft(), this.right);
        else if (this.right.size() > 1)
          return new deque(new _struct.fdequelette([this.right.peekLeft()]), this.middle, this.right.removeLeft());
        else
          return new singleDeque(this.right.peekLeft());
      };

      Deque.prototype.removeRight = function () {
        if (this.right.size() > 1)
          return new deque(this.left, this.middle, this.right.removeRight());
        else if (!this.middle.isEmpty())
          return new deque(this.left, this.middle.removeRight(), this.middle.peekRight());
        else if (this.left.size() > 1)
          return new deque(this.left.removeRight(), this.middle, new _struct.fdequelette([this.left.peekRight()]));
        else
          return new singleDeque(this.left.peekRight());
      };

      return Deque;

    }();

    return FingerTree;

  }();

  // Underscore Binary Search Tree
  // -----------------------------
  // A binary search tree are trees with at most two child nodes, with elements stored
  // in symmetric order. This guarantees that the left subtree will always contain
  // elements smaller than the node itself, and the right subtree will always contain
  // elements larger than itself.
  structs.bsTree = _struct.bsTree = function () {

    BinSearchTree.prototype.VERSION = VERSION;

    // Creates a new bsTree object. Pass an array of elements, a valid
    // bsTree node, or leave empty to initialize an empty tree.
    function BinSearchTree(obj, comparator) {
      if (_.isFunction(comparator))
        this.comparator = comparator;
      if (_.isArray(obj))
        this.struct = _.reduce(obj, function (struct, obj) {
          return this.insert(obj, struct).struct;
        }, null, this);
      else if (this._validate(obj))
        this.struct = obj;
      else if (obj)
        this.struct = this._cons(null, obj, null);
      else
        this.struct = null;
    }

    // Creates a bsTree node.
    BinSearchTree.prototype._cons = function (left, curr, right) {
      curr = (curr === void 0) ? null : curr;
      return { left: left, curr: curr, right: right };
    };

    // Exports a bsTree instance for use in an **Underscore.js** mixin.
    BinSearchTree.prototype._exports = function () {
      return {
        bsTree: function (obj, comparator) {
          return new BinSearchTree(obj, comparator);
        }
      };
    };

    // Returns true if the given object is a binary search tree node.
    BinSearchTree.prototype._validate = function (obj) {
        return isStrictObject(obj) &&
               _.has(obj, 'left')  &&
               _.has(obj, 'curr')  &&
               _.has(obj, 'right');
    };

    // The default comparison function uses the global `compareTo` helper.
    BinSearchTree.prototype.comparator = compareTo;

    // Finds an object in the binary search tree.
    BinSearchTree.prototype.find = function (obj, comparator) {
      if (this.struct === null)
        return _.bsTree();
      comparator = comparator || this.comparator;
      var compare = comparator(this.struct.curr, obj);
      if (compare < 0)
        return this.right().find(obj, comparator);
      else if (compare > 0)
        return this.left().find(obj, comparator);
      else if (compare === 0)
        return this;
    };

    // Inserts a node into the bsTree. Assume the struct
    // is the root of a bsTree, and the obj is the object to insert.
    BinSearchTree.prototype.insert = function (obj, struct, comparator) {
      comparator = comparator || this.comparator;
      struct = struct || this.struct || null;
      if (struct === null)
        return _.bsTree(this._cons(null, obj, null));
      else {
        var compare = comparator(struct.curr, obj);
        if (compare < 0) {
          var right = this.insert(obj, struct.right);
          return _.bsTree(this._cons(struct.left, struct.curr, right.struct));
        } else if (compare > 0) {
          var left = this.insert(obj, struct.left);
          return _.bsTree(this._cons(left.struct, struct.curr, struct.right));
        }
        // if they are the same, do nothing (allow no duplicates).
      }
    };

    // Returns the left child of the tree.
    BinSearchTree.prototype.left = function () {
        return _.bsTree(this.struct.left);
    };

    // Add your own custom functions to every bsTree object.
    BinSearchTree.prototype.mixin = function (obj) {
      mixin.apply(this, [obj, BinSearchTree.prototype]);
    };

    // Returns the right child of the tree.
    BinSearchTree.prototype.right = function () {
        return _.bsTree(this.struct.right);
    };

    // Retrieve the value of the current node in the bsTree.
    BinSearchTree.prototype.val = function (obj) {
      if (obj)
        return _.bsTree(this._cons(this.struct.left, obj, this.struct.right));
      return this.struct ? this.struct.curr : this.struct;
    };

    return BinSearchTree;

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
