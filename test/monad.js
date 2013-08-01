$(function () {

  module('Monad functions');

  test('Create a writer monad', function() {
    // http://en.wikipedia.org/wiki/Monad_(functional_programming)
    // The Writer monad allows a process to carry additional information "on the side",
    // along with the computed value. This can be useful to log error or debugging information
    // which is not the primary result.
    var unit = function(value) { return [value, '']; };
    var bind = function(monad, callback) {
      var value  = monad[0],
      log  = monad[1],
      result = callback(value);
      return [ result[0], log + result[1] ];
    };
    var pipeline = function(monad, functions) {
      for (var i = 0, n = functions.length; i < n; i++)
          monad = bind(monad, functions[i]);
      return monad;
    };

    var squared = function(x) { return [x * x, 'was squared.']; };
    var halved = function(x) { return [x / 2, 'was halved.']; };

    var monad = _.monad(unit, bind, pipeline);
    var result = monad.process(4, [squared, halved]);
    equal(result[0], 8, '8 was squared and halved');
    equal(result[1], 'was squared.was halved.', 'writer monad produced correct output');
  });

});