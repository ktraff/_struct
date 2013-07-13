$(function () {

  module('List functions');

  test('Create a list', function() {
    var list = _.list([1, 2, 3]);
    equal(typeof list, 'object', 'list is not an object');
  });

  test('Create an empty list', function() {
    var list = _.list([]);
    strictEqual(list.struct, null, 'list is not null');
  });

  test('Find an element in a list', function() {
    var list = _.list([1, 2, 3]);
    var elem = list.find(1);
    equal(elem, 1, 'could not find the right element in the list');
  });
});