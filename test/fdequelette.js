$(function () {

  module('FDequelette functions');

  test('Create dequelettes of various sizes', function() {
    var single = new _struct.fdequelette(1);
    ok(single.TYPE === 'one', 'created a single dequelette');
    equal(single.val(), 1, 'inserted `1` into the dequelette');
    single = new _struct.fdequelette([1]);
    ok(single.TYPE === 'one', 'created a single dequelette with an array');
    equal(single.val(), 1, 'inserted `1` into the dequelette');
    var doub = new _struct.fdequelette([1, 2]);
    ok(doub.TYPE === 'two', 'created a doub dequelette');
    equal(doub.val()[0], 1, 'inserted `1` into the dequelette');
    equal(doub.val()[1], 2, 'inserted `2` into the dequelette');
    var triple = new _struct.fdequelette([1, 2, 3]);
    ok(triple.TYPE === 'three', 'created a triple dequelette');
    equal(triple.val()[0], 1, 'inserted `1` into the dequelette');
    equal(triple.val()[1], 2, 'inserted `2` into the dequelette');
    equal(triple.val()[2], 3, 'inserted `3 into the dequelette');
    var quatruple = new _struct.fdequelette([1, 2, 3, 4]);
    ok(quatruple.TYPE === 'four', 'created a quatruple dequelette');
    equal(quatruple.val()[0], 1, 'inserted `1` into the dequelette');
    equal(quatruple.val()[1], 2, 'inserted `2` into the dequelette');
    equal(quatruple.val()[2], 3, 'inserted `3 into the dequelette');
    equal(quatruple.val()[3], 4, 'inserted `4 into the dequelette');
  });

});