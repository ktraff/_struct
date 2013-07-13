$(function () {

  module('List functions');

  test('Create a list', function() {
    var list = _.list([1, 2, 3]);
    equal(typeof list, 'object', 'list is not an object');
  });

  test('Create an empty list', function() {
    var list = _.list([]);
    strictEqual(list.isEmpty(), true, 'list is not empty');
  });

  test('Find an element in a list', function() {
    var list = _.list([1, 2, 3]);
    var elem = list.find(1);
    equal(elem, 1, 'could not find the right element in the list');
    var elem = list.find(3);
    equal(elem, 3, 'could not find the right element in the list');
    var elem = list.find(2);
    equal(elem, 2, 'could not find the right element in the list');
    var elem = list.find(4);
    strictEqual(elem, undefined, 'expected not to find 4, but found something other than `undefined`');
  });
});