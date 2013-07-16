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

  test('Insert an element into a list', function() {
    var obj = { key: 'value' };
    var finder = function (token, obj, list) {
      return token['key'] == obj['key'];
    };
    var list = _.list();
    newList = list.insert(obj);
    var found = list.find(obj, finder);
    equal(found.val(), null, '`obj` was not found in the original list');
    var found = newList.find(obj);
    equal(found.val(), obj, '`obj` was found in the new list');
  });


});