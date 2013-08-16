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

  test('Insert and remove items from one node', function () {
    var single = new _struct.fdequelette(1);
    strictEqual(single.removeLeft(), single, 'removing item from one node does nothing');
    var doub = single.insertLeft(0);
    strictEqual(doub.TYPE, 'two', 'inserting an item creates a double dequelette');
    strictEqual(doub.val()[0], 0, 'first element is zero');
    strictEqual(doub.val()[1], 1, 'second element is one');
    strictEqual(single.val(), 1, 'single dequelette has not changed');
  });

   test('Insert and remove items from two node', function () {
    var doub = new _struct.fdequelette([1, 2]);
    var single = doub.removeLeft();
    strictEqual(single.TYPE, 'one', 'removed an item from doub');
    strictEqual(single.val(), 2, 'remaining value is the item on the right');
    single = doub.removeRight();
    strictEqual(single.TYPE, 'one', 'removed an item from doub');
    strictEqual(single.val(), 1, 'remaining value is the item on the left');
    var triple = doub.insertRight(3);
    strictEqual(triple.val()[0], 1, 'first element is one');
    strictEqual(triple.val()[1], 2, 'second element is two');
    strictEqual(triple.val()[2], 3, 'third element is three');
    triple = doub.insertLeft(0);
    strictEqual(triple.val()[0], 0, 'first element is zero');
    strictEqual(triple.val()[1], 1, 'second element is one');
    strictEqual(triple.val()[2], 2, 'third element is two');
    deepEqual(doub.val(), [1, 2], 'doub dequelette has not changed');
  });

  test('Insert and remove items from three node', function () {
    var triple = new _struct.fdequelette([1, 2, 3]);
    var doub = triple.removeLeft();
    strictEqual(doub.TYPE, 'two', 'removed an item from triple');
    deepEqual(doub.val(), [2, 3], 'remaining value is the item on the right');
    doub = triple.removeRight();
    strictEqual(doub.TYPE, 'two', 'removed an item from triple');
    deepEqual(doub.val(), [1, 2], 'remaining value is the item on the left');
    var quatruple = triple.insertRight(4);
    strictEqual(quatruple.val()[0], 1, 'first element is one');
    strictEqual(quatruple.val()[1], 2, 'second element is two');
    strictEqual(quatruple.val()[2], 3, 'third element is three');
    strictEqual(quatruple.val()[3], 4, 'fourth element is four');
    quatruple = triple.insertLeft(0);
    strictEqual(quatruple.val()[0], 0, 'first element is zero');
    strictEqual(quatruple.val()[1], 1, 'second element is one');
    strictEqual(quatruple.val()[2], 2, 'third element is two');
    strictEqual(quatruple.val()[3], 3, 'fourth element is three');
    deepEqual(triple.val(), [1, 2, 3], 'triple dequelette has not changed');
  });

  test('Insert and remove items from four node', function () {
    var quat = new _struct.fdequelette([1, 2, 3, 4]);
    var triple = quat.removeLeft();
    strictEqual(triple.TYPE, 'three', 'removed an item from quat');
    deepEqual(triple.val(), [2, 3, 4], 'remaining value is the item on the right');
    triple = quat.removeRight();
    strictEqual(triple.TYPE, 'three', 'removed an item from quat');
    deepEqual(triple.val(), [1, 2, 3], 'remaining value is the item on the left');
    var quatruple = quat.insertRight(4);
    strictEqual(quatruple, quatruple, 'quatruple unchanged after inserting item');
    quatruple = quat.insertLeft(0);
    strictEqual(quatruple, quatruple, 'quatruple unchanged after inserting item');
    deepEqual(quat.val(), [1, 2, 3, 4], 'quat dequelette has not changed');
  });

});