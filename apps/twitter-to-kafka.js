var config = require('../config/tweetanalyze')
var Twitter = require('twitter')
 
var twitter = new Twitter(config.twitter)
var kafka = require('kafka-node')
var io = require('socket.io')(8080)
var protobuf = require('protocol-buffers')
var fs = require('fs');

var topic = 'twitter-raw';
var producer = new kafka.Producer(new kafka.Client());
var messages = protobuf(fs.readFileSync('tweet.proto'));

producer.on('ready', function(){
  twitter.stream('statuses/sample', function(stream){
    var debug = null;
    stream.on('data', function(tweet){
      debug = tweet;
      console.log(tweet.text);
      var buf = tweet_to_buffer(messages, tweet);
      if (buf){
        console.log(buf);
        producer.send([{topic: topic, messages: buf}], function(err, data){
          io.emit('tweet', tweet.text)
        })
      }
    });
    stream.on('error', function(err){
      console.error("Error in twitter stream: "+err);
      console.dir(debug);
      process.exit(1);
    });
  })
})
producer.on('error', function(err){
  console.error("Kafka producer encountered an error")
    process.exit(1)
})

function tweet_to_buffer(messages, tweet){
  if (!tweet.id){ return null; }
  tweet.hashtags = [];
  if (tweet.entities.hashtags.length > 0){
    tweet.entities.hashtags.forEach(function(tag) {
      tweet.hashtags.push(tag.text);
    });
  }
  var buf = messages.Tweet.encode(tweet);
  return buf;
}
