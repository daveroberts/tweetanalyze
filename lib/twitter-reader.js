class TwitterReader {
  constructor(keys){
    var Twitter = require('twitter');
    this.client = new Twitter(keys);
  }

  sample_stream(next){
    this.client.stream('statuses/sample', function(stream) {
      stream.on('data', function(tweet) {
        next(tweet);
      });

      stream.on('error', function(error) {
        throw error;
      });
    });
  }
}

export default TwitterReader
