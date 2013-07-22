$(function () {

  var a10 = [];
  for (var i = 1; i < 11; i++) { a10.push(i); }

  module('Zipper functions');

  test('Create a zipper', function() {
    var zipper = _.zipper();
    strictEqual(zipper.struct, null, 'zipper contains a null reference');
    zipper = _.zipper(a10);
    strictEqual(typeof zipper.struct, 'object', 'zipper contains an initialized object');
  });

  test('Move the zipper around', function () {
    var zipper = _.zipper(a10);
    strictEqual(zipper.left().val(), null, 'zipper is at the leftmost position');
    strictEqual(zipper.right().right().val(), 3, 'zipper is at the third position');
    var count = 1;
    for (var i = 1; i < a10.length; i++) {
      zipper = zipper.right();
      strictEqual(zipper.val(), ++count, zipper.val() + ' matches ' + count);
    }
    strictEqual(zipper.right().val(), null, 'moved ' + count + ' spaces to reach the end of the list');
  });

  test('Move the zipper around, multiple places at once', function () {
    var zipper = _.zipper(a10);
    strictEqual(zipper.left().val(), null, 'zipper is at the leftmost position');
    strictEqual(zipper.left(4).val(), null, 'zipper is at the leftmost position');
    strictEqual(zipper.right(0).val(), 2, 'moved zipper one place to the right. Even though I pass in zero, right() will still move right at least once');
    strictEqual(zipper.right(1).val(), 2, 'moved zipper one place to the right');
    strictEqual(zipper.right(4).val(), 5, 'moved zipper four places to the right');
    strictEqual(zipper.right(9).val(), 10, 'moved zipper 9 places to the right');
    strictEqual(zipper.right(10).val(), null, 'moved zipper 10 places to the right, past the end of the list');
  });

  test('Retrieve and update a zipper\'s value', function () {
    var zipper = _.zipper(a10);
    var mid = zipper.right().right().right().right();
    strictEqual(mid.val(), 5, 'at the middle of the zipper');
    var newMid = mid.val(5.5);
    strictEqual(mid.val(), 5, '5 is still at the middle of the original zipper');
    strictEqual(newMid.val(), 5.5, 'the middle of the new list is 5.5');
  });

});