$(function () {

  module('List functions');

  test('deepEqual', function() {
    var arr =  ['foo1'],
      sorted = ['foo1'];
    deepEqual(arr, sorted, 'deep equal fails');
  });

  test('create a list', function() {
    _.list([1, 2, 3]);
    equal(1, 1, 'one doesn\'t equal one');
  });
});