(function () {

  jslitmus.test('mapping multiplication to 10,000 elements', function() {
    var arr = [];
    for (var i = 0; i < 5; i++) { arr.push(i); }
    return _.map(arr, function(num) { return num * 3; });
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