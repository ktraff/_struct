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

  test('Retrieve and update a zipper\'s value', function () {
    var zipper = _.zipper(a10);
    var mid = zipper.right().right().right().right();
    strictEqual(mid.val(), 5, 'at the middle of the zipper');
    var newMid = mid.val(5.5);
    strictEqual(mid.val(), 5, '5 is still at the middle of the original zipper');
    strictEqual(newMid.val(), 5.5, 'the middle of the new list is 5.5');
  });

});