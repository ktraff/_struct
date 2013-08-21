$(function () {

  module('Finger Tree functions');

  test('Create an empty finger tree', function () {
      var fingertree = _.fingertree();
      strictEqual(fingertree.peekLeft(), null, 'no elements in the finger tree');
  });

  test('Create an single finger tree', function () {
      var fingertree = _.fingertree(1);
      strictEqual(fingertree.struct.TYPE, 'single', 'created a single tree with an int');
      strictEqual(fingertree.peekLeft(), 1, 'one element in the finger tree');
      fingertree = _.fingertree([1]);
      strictEqual(fingertree.struct.TYPE, 'single', 'created a single tree with an array');
      strictEqual(fingertree.peekLeft(), 1, 'one element in the finger tree');
      strictEqual(fingertree.peekRight(), 1, 'one element in the finger tree');
  });

  test('Create a finger tree with multiple elements, perform some insertion and deletion', function () {
      var fingertree = _.fingertree([1, 2]);
      strictEqual(fingertree.struct.TYPE, 'deque', 'created a finger tree with two ints');
      strictEqual(fingertree.peekLeft(), 1, '`1` is the first element in the finger tree');
      strictEqual(fingertree.peekRight(), 2, '`2` is the second element in the finger tree');
      fingertree = _.fingertree([1, 2, 3, 4, 5]);
      strictEqual(fingertree.struct.TYPE, 'deque', 'created a finger tree with many ints');
      strictEqual(fingertree.peekLeft(), 1, '`1` is the first element in the finger tree');
      strictEqual(fingertree.peekRight(), 5, '`5` is the last element in the finger tree');
      var removedTree = fingertree;
      for (var i = 4; i > 0; i--) {
        removedTree = removedTree.removeRight();
        strictEqual(removedTree.peekRight(), i, '`' + i + '` is the last element in the finger tree with ' + (5 - i) + ' elements removed');
      }
      strictEqual(removedTree.removeRight().peekRight(), null, 'the list is null after removing all elements');
      removedTree = fingertree;
      for (i = 2; i <= 5; i++) {
        removedTree = removedTree.removeLeft();
        strictEqual(removedTree.peekLeft(), i, '`' + i + '` is the first element in the finger tree with ' + (i - 1) + ' elements removed');
      }
      strictEqual(removedTree.removeLeft().peekLeft(), null, 'the list is null after removing all elements');
  });

  test('Insert and remove elements from an empty finger tree', function () {
      var emptyTree = _.fingertree();
      strictEqual(emptyTree.peekLeft(), null, 'no elements in the finger tree');
      var singleTree = emptyTree.insertLeft(1);
      strictEqual(singleTree.struct.TYPE, 'single', 'empty tree is now a single tree');
      strictEqual(singleTree.peekLeft(), 1, 'inserted 1 into the finger tree');
      emptyTree = singleTree.removeRight();
      strictEqual(emptyTree.peekLeft(), null, 'removed 1 from the single tree');
      var doubleTree = emptyTree.insertRight(2).insertLeft(1);
      strictEqual(doubleTree.struct.TYPE, 'deque', 'empty tree is now a double tree');
      strictEqual(doubleTree.peekLeft(), 1, '1 inserted into the leftmost position');
      strictEqual(doubleTree.peekRight(), 2, '2 inserted into the rightmost position');
      singleTree = doubleTree.removeLeft();
      strictEqual(singleTree.peekLeft(), 2, '1 removed from the double tree');
      strictEqual(singleTree.peekRight(), 2, '1 removed from the double tree');
      singleTree = doubleTree.removeRight();
      strictEqual(singleTree.peekLeft(), 1, '2 removed from the double tree');
      strictEqual(singleTree.peekRight(), 1, '2 removed from the double tree');
      emptyTree = doubleTree.removeLeft().removeRight();
      strictEqual(emptyTree.peekLeft(), null, 'no elements in the finger tree');
  });

  test('Insert and remove elements from an single finger tree', function () {
      var singleTree = _.fingertree([1]);
      strictEqual(singleTree.struct.TYPE, 'single', 'empty tree is now a single tree');
      strictEqual(singleTree.peekLeft(), 1, 'inserted 1 into the finger tree');
      var emptyTree = _.fingertree();
      strictEqual(emptyTree.peekLeft(), null, 'no elements in the finger tree');
      emptyTree = singleTree.removeRight();
      strictEqual(emptyTree.peekLeft(), null, 'removed 1 from the single tree');
      var doubleTree = emptyTree.insertRight(2).insertLeft(1);
      strictEqual(doubleTree.struct.TYPE, 'deque', 'empty tree is now a double tree');
      strictEqual(doubleTree.peekLeft(), 1, '1 inserted into the leftmost position');
      strictEqual(doubleTree.peekRight(), 2, '2 inserted into the rightmost position');
      singleTree = doubleTree.removeLeft();
      strictEqual(singleTree.peekLeft(), 2, '1 removed from the double tree');
      strictEqual(singleTree.peekRight(), 2, '1 removed from the double tree');
      singleTree = doubleTree.removeRight();
      strictEqual(singleTree.peekLeft(), 1, '2 removed from the double tree');
      strictEqual(singleTree.peekRight(), 1, '2 removed from the double tree');
      emptyTree = doubleTree.removeLeft().removeRight();
      strictEqual(emptyTree.peekLeft(), null, 'no elements in the finger tree');
  });

});