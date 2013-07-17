$(function () {

  module('List functions');

  test('Create a list', function() {
    var list = _.list([1, 2, 3]);
    equal(typeof list, 'object', 'list contains an initialized object');
  });

  test('Create an empty list with an empty array', function() {
    var list = _.list([]);
    strictEqual(list.isEmpty(), true, 'list is initialized to an empty list');
  });

  test('Create an empty list with an empty constructor', function() {
    var list = _.list();
    strictEqual(list.isEmpty(), true, 'list is initialized to an empty list');
  });

  test('Create a list with an existing list', function() {
    var list = _.list([1, 2, 3]);
    var newList = _.list(list.struct);
    var elem = newList.find(1);
    equal(elem.val(), 1, 'new list contains elements from the original list');
  });

  test('Find an element in a list', function() {
    var list = _.list([1, 2, 3]);
    var found = list.find(1);
    equal(found.val(), 1, '`1` was found in the list');
    found = list.find(3);
    equal(found.val(), 3, '`3` was found in the list');
    found = list.find(2);
    equal(found.val(), 2, '`2` was found in the list');
    found = list.find(4);
    strictEqual(found.val(), null, '`4` was not found in the list');
    found = list.find({ elem: 'value' });
    strictEqual(found.val(), null, '`{ elem: \'value\' }` was not found in the list');
  });

  test('Insert elements into a list', function() {
    var obj = { key: 'value' };
    var obj2 = { key: 'value2' };
    var comparator = function (token, obj, list) {
      return token['key'] == obj['key'];
    };
    var list = _.list();
    newList = list.insert(obj);
    var found = list.find(obj, comparator);
    equal(found.val(), null, '`obj` was not found in the original list');
    found = newList.find(obj);
    equal(found.val(), obj, '`obj` was found in the new list');
    newList = newList.insert(obj2);
    found = newList.find(obj2, comparator);
    equal(found.val(), obj2, '`obj2` was found in the new list');
  });

  test('Get the next element of the list', function () {
    var list = _.list([1, 2, 3]);
    var next = list.next();
    strictEqual(next.val(), 2, '2 is the next element of the list');
    var third = list.next().next();
    strictEqual(third.val(), 3, '3 is the third element of the original list');
    next = next.next();
    strictEqual(next.val(), 3, '3 is the next element of the next list');
    third = third.next();
    strictEqual(third.val(), null, 'null is the next element of the third list');
  });

  test('Get the length of a list', function () {
    var list = _.list([1, 2, 3]);
    strictEqual(list.length(), 3, 'the list has three elements');
    list = list.empty();
    strictEqual(list.length(), 0, 'the emptied list has zero elements');
  });

  test('Create a simple mixin', function () {
    _.list().mixin({
      addOne: function () {
        return this.insert(1);
      }
    });
    var list = _.list();
    list.addOne();
  })

});