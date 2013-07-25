$(function () {

  var a10 = [];
  for (var i = 1; i < 11; i++) { a10.push(i); }

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
    strictEqual(found.val(), 1, '`1` was found in the list');
    found = list.find(3);
    strictEqual(found.val(), 3, '`3` was found in the list');
    found = list.find(2);
    strictEqual(found.val(), 2, '`2` was found in the list');
    found = list.find(4);
    strictEqual(found.val(), null, '`4` was not found in the list');
    found = list.find({ elem: 'value' });
    strictEqual(found.val(), null, '`{ elem: \'value\' }` was not found in the list');
    list = _.list();
    found = list.find(1);
    strictEqual(found.val(), null, '`1` was not found in an empty list');
  });

  test('Retrieve and update a list\'s value', function () {
    var list = _.list(a10);
    var mid = list.next(4);
    strictEqual(mid.val(), 5, 'at the middle of the list');
    var newMid = mid.val(5.5);
    strictEqual(mid.val(), 5, '5 is still at the middle of the original list');
    strictEqual(newMid.val(), 5.5, 'the middle of the new list is 5.5');
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

    list = _.list().val(1);
    equal(list.val(), 1, 'inserted `1` into an empty list using val()');
  });

  test('Insert elements into a list, using val()', function() {
    var list = _.list();
    list = list.val(1);
    strictEqual(list.val(), 1, 'inserted `1` into an empty list using val()');

    list = list.remove(1).val(2);
    strictEqual(list.val(), 2, 'inserted `2` into an empty list using val()');
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

  test('Get the next elements of the list, using arguments', function () {
    var list = _.list(a10);
    var next = list.next(4);
    equal(next.val(), 5, 'moved four elements to the right');
    var next = list.next(1);
    equal(next.val(), 2, 'moved one element to the right');
  });

  test('Get the next element of an empty list', function () {
    var list = _.list();
    var next = list.next();
    strictEqual(next.val(), null, 'next element of an empty list is null');
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
      },
      addTwo: function () {
        return this.insert(2);
      }
    });
    var list = _.list();
    list = list.addOne();
    var found = list.find(1);
    strictEqual(found.val(), 1, '`1` was found in the list');
    list = _.list();
    list = list.addTwo();
    found = list.find(2);
    strictEqual(found.val(), 2, '`2 was found in the list');
  });

  test('Remove an element from a list', function () {
    var list = _.list();
    list = list.remove(1);
    strictEqual(list.val(), null, 'removing element from empty list');
    list = list.insert(2).insert(1);
    var found = list.find(1);
    strictEqual(found.val(), 1, '`1` was found in the list');
    list = list.remove(1);
    strictEqual(list.val(), 2, '`1` was removed in the list');
    list = list.insert(1).remove(2);
    strictEqual(list.val(), 1, '`2` was removed in the list');
  });

  test('Remove elements from a larger list', function () {
    var list = _.list(a10).remove(5).remove(1).remove(7);
    strictEqual(list.find(5).val(), null, '`5` was removed in the list');
    strictEqual(list.find(7).val(), null, '`7` was removed in the list');
    strictEqual(list.find(1).val(), null, '`1` was removed in the list');
    strictEqual(list.find(2).val(), 2, '`2` was not removed in the list');
  });

});