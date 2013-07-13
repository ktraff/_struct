(function () {
  // toggle speed testing by extending jslitmus tests
  var runSpeedTests = false;
  var test = function () {
    if (runSpeedTests) { jslitmus.test.apply(jslitmus, arguments); }
  };

  var a10k = [];
  for (var i = 0; i < 10000; i++) { a10k.push(i); }

  var a10kList = _.list(a10k);

  test('creating list of 10,000 elements', function() {
    return _.list(a10k);
  });

  test('finding an element in list of 10,000', function() {
    return a10kList.find(500);
  });

  // 'complete' fires for each test when it finishes.
  jslitmus.on('complete', function(test) {
    // Output test results
    console.log(test + '');
  });

  // 'all_complete' fires when all tests have finished.
  jslitmus.on('all_complete', function() {
    // Get the results image URL
    var url = jslitmus.getGoogleChart();
    console.log('Chart url: ' + jslitmus.getGoogleChart());
    document.getElementById('speedResults').src = url;

    // That url is often obscenely long, so let's get a shortened
    // version from bit.ly.
    BitlyCB.onShorten = function(data) {
      if (data.results) {
        for (var key in data.results) {
          if (data.results[key]) {
            break;
          }
        }
        var shortUrl = data.results[key].shortUrl;
        // Show the URL
        console.log('Shortened chart url: ' + shortUrl);
      } else {
        // Hmm... not what we were expecting, so just dump whatever we got
        console.log('Unable to shorten. Server response:');
        console.dir(data);
      }
    };
    BitlyClient.shorten(url, 'BitlyCB.onShorten');
  });

  jslitmus.runAll();

})();