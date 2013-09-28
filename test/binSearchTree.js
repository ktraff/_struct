$(function () {

  var a2 = [11, 2];
  var a10 = [11, 2, 4, 5, 3, 13, 17, 9, 8, 10, 7];

  module('Binary Search Tree functions');

  test('Create a binary search tree', function () {
    var tree = _.bsTree();
    strictEqual(tree.val(), null, 'created an empty binary search tree');
    tree = _.bsTree(1);
    strictEqual(tree.val(), 1, 'created a binary search tree with 1 element');
    tree = _.bsTree([1]);
    strictEqual(tree.val(), 1, 'created a binary search tree with 1 element');
    tree = _.bsTree(a10);
    strictEqual(tree.val(), 11, 'created a binary search tree with 10 elements');
  });

  test('Create a binary search tree with objects', function () {
    var tree = _.bsTree(_.map(a10, function (num) {
        return { value: num };
    }), function (elem1, elem2) {
        if (elem1.value < elem2.value)
          return -1;
        else if (elem1.value > elem2.value)
          return 1;
        return 0;
    });
    deepEqual(tree.val(), { value: 11 }, 'created a binary search tree with 10 elements');
  });

  test('Get the left and right children of the tree', function () {
    var tree = _.bsTree(a10);
    strictEqual(tree.val(), 11, 'the root node is 11');
    strictEqual(tree.left().val(), 2, 'the left child is 2');
    strictEqual(tree.right().val(), 13, 'the left child is 13');
    strictEqual(tree.right().right().val(), 17, 'the left child is 17');
    strictEqual(tree.val(), 11, 'the root node of the original tree is still 11');
    strictEqual(tree.left().right().val(), 4, 'the right child of the left child is 4');
    strictEqual(tree.left().right().right().val(), 5, 'the next child is 5');
    strictEqual(tree.left().right().left().val(), 3, 'the next child is 3');
    strictEqual(tree.left().right().right().right().val(), 9, 'the next child is 9');
    strictEqual(tree.left().right().right().right().left().val(), 8, 'the next child is 8');
    strictEqual(tree.left().right().right().right().right().val(), 10, 'the next child is 10');
  });

  test('Find nodes in a tree', function () {
    var tree = _.bsTree(a10);
    strictEqual(tree.find(11).val(), 11, 'found 11');
    strictEqual(tree.find(13).val(), 13, 'found 13');
    strictEqual(tree.find(9).val(), 9, 'found 9');
    strictEqual(tree.find(8).val(), 8, 'found 8');
    strictEqual(tree.find(19).val(), null, 'did not find 19');
  });

  test('Insert nodes in a binary search tree', function () {
    var tree = _.bsTree(a10);
    var tree2 = tree.insert(17);
    strictEqual(tree2.right().right().val(), 17, 'inserted 17 into an existing place, so the tree stays the same');
    var tree3 = tree.insert(18);
    strictEqual(tree3.right().right().right().val(), 18, 'inserted 18 into the tree');
    var tree4 = tree.insert(11);
    strictEqual(tree4.val(), 11, 'inserted existing root element into the tree');
  });

  test('Remove nodes from the tree', function () {
    var tree = _.bsTree(a10);
    var tree2 = tree.remove(17);
    strictEqual(tree2.right().right().val(), null, 'removed 17 (leaf) from the tree');
    strictEqual(tree.right().right().val(), 17, '17 still exists in the original tree');
    var tree3 = tree2.remove(13);
    strictEqual(tree3.right().val(), null, 'removed 13 (leaf) from the tree');
    strictEqual(tree2.right().val(), 13, '13 still exists in the second tree');
    strictEqual(tree.right().val(), 13, '13 still exists in the original tree');
    var tree4 = tree.remove(3);
    strictEqual(tree4.left().right().left().val(), null, 'removed 3 (leaf) from the tree');
    strictEqual(tree.left().right().left().val(), 3, '3 still in the original tree');
    var tree5 = tree.remove(2);
    strictEqual(tree5.left().val(), 4, 'removed 2 (has one right child) from the tree');
    strictEqual(tree.left().val(), 2, '2 still in the original tree');
    var tree6 = tree.remove(8);
    strictEqual(tree6.left().right().right().right().left().val(), 7, 'removed 8 (has one left child) from the tree');
    strictEqual(tree.left().right().right().right().left().val(), 8, '8 still in the original tree');
    var tree7 = _.bsTree(a2);
    var tree8 = tree7.remove(11);
    strictEqual(tree8.val(), 2, 'removed the root node (one left child) from the tree');
    strictEqual(tree7.val(), 11, 'root node still exists in the original tree');
    var tree9 = tree8.remove(2);
    strictEqual(tree9.val(), null, 'removed the last (root) node from the tree');
    strictEqual(tree8.val(), 2, 'root node still exists in the original tree');
    var tree10 = tree.remove(11);
    strictEqual(tree10.val(), 13, 'removed the root node (2 children) from the tree');
    strictEqual(tree.val(), 11, 'root node still exists in the original tree');
    var tree11 = _.bsTree([2, 1, 3]);
    var tree12 = tree11.remove(2);
    strictEqual(tree12.val(), 3, 'removed the root node (2 children) from the tree with only 3 nodes');
    strictEqual(tree12.right().val(), null, '3 removed from right subtree');
    strictEqual(tree12.left().val(), 1, '1 still in left subtree');
    strictEqual(tree11.val(), 2, 'root node still exists in the original tree');
    var tree13 = _.bsTree([1, 2]);
    var tree14 = tree13.remove(1);
    strictEqual(tree14.val(), 2, 'removed the root node (one right child) from the tree');
    strictEqual(tree14.right().val(), null, 'no more child nodes in tree');
    strictEqual(tree14.left().val(), null, 'no more child nodes in tree');
    strictEqual(tree13.val(), 1, 'root node still exists in the original tree');
    var tree15 = tree.remove(4);
    strictEqual(tree15.left().right().val(), 5, 'removed a non-root node (2 children) from the tree');
    strictEqual(tree15.find(4).val(), null, '4 removed from the tree');
    strictEqual(tree.left().right().val(), 4, '4 still in the original tree');
  });

});