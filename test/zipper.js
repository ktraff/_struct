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

    var z2 = _.zipper();
    z2 = z2.val(1);
    strictEqual(z2.val(), 1, 'inserted 1 into an empty list');
    z2 = z2.remove(1).val(2);
    strictEqual(z2.val(), 2, 'inserted 2 into an empty list');
  });

  test('Remove values from a zipper', function () {
    var zipper = _.zipper(a10);
    var mid = zipper.right(4);
    strictEqual(mid.val(), 5, 'moved to the middle of the zipper');
    strictEqual(mid.remove().val(), 6, 'removed 5 from the zipper');
    strictEqual(zipper.remove().val(), 2, 'removed 1 from the zipper');
    strictEqual(zipper.left().remove().val(), null, 'attempted to remove a null element from the zipper');
    var end = zipper.right(9);
    strictEqual(end.val(), 10, 'moved to the end of the zipper');
    strictEqual(end.remove().val(), 9, 'removed the last element from the zipper');
    strictEqual(end.right().remove().val(), null, 'attempted to remove a null element from the zipper');
  });

  test('Insert a value to the left of the current zipper element', function () {
    var zipper = _.zipper(a10);
    var mid = zipper.right(4).remove();
    strictEqual(mid.val(), 6, 'removed middle element of the zipper');
    mid = mid.insertLeft(5);
    strictEqual(mid.val(), 5, 're-inserted 5 to the middle of the list');
    var newZipper = zipper.insertLeft(0);
    strictEqual(zipper.val(), 1, 'zipper is still at one');
    strictEqual(zipper.left().val(), null, 'zipper is still unchanged');
    strictEqual(newZipper.val(), 0, 'inserted zero at the beginning of the list');
  });

  test('Insert a value to the right of the current zipper element', function () {
    var zipper = _.zipper(a10);
    var mid = zipper.right(4).remove();
    strictEqual(mid.val(), 6, 'removed middle element of the zipper');
    mid = mid.left();
    strictEqual(mid.val(), 4, 'moved to the left, 5 has been removed');
    mid = mid.insertRight(5);
    strictEqual(mid.val(), 5, 're-inserted 5 to the middle of the list');
    var end = zipper.right(9);
    var newEnd = end.insertRight(11);
    strictEqual(end.val(), 10, '10 still lies at the end of the list');
    strictEqual(end.right().val(), null, 'end list is unchanged');
    strictEqual(newEnd.val(), 11, '11 added to the end of the list');
  });

});