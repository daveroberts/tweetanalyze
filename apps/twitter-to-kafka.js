var config = require('../config/tweetanalyze')
var Twitter = require('twitter')
var kafka = require('kafka-node')
var protobuf = require("protobufjs");
var conv = require('binstring');

var twitter = new Twitter(config.twitter)
var io = require('socket.io')(8080)

var topic = 'twitter-raw';
var producer = new kafka.Producer(new kafka.Client());
var builder = protobuf.loadProtoFile("tweet.proto");
var Tweet = builder.build("Tweet")
var User = builder.build("User")
var Place = builder.build("Place")

producer.on('ready', function(){
  twitter.stream('statuses/sample', function(stream){
    var debug = null;
    stream.on('data', function(tweet){
      debug = tweet;
      var buf = tweet_to_buffer(tweet);
      if (buf){
        console.log(buf);
        producer.send([{topic: topic, messages: buf}], function(err, data){
          process.stdout.write("t");
          //console.log(tweet.text);
          io.emit('tweet', tweet.text)
        })
      }
    });
    stream.on('error', function(err){
      console.error("Error in twitter stream: "+err);
      //console.dir(debug);
      process.exit(1);
    });
  })
})
producer.on('error', function(err){
  console.error("Kafka producer encountered an error")
    process.exit(1)
})

function tweet_to_buffer(ltweet){
  if (!ltweet.id){ return null; }
  var jtweet = {};
  jtweet.id_str = ltweet.id_str;
  jtweet.text = ltweet.text;
  jtweet.created_at = ltweet.text;
  jtweet.hashtags = [];
  if (ltweet.entities.hashtags.length > 0){
    ltweet.entities.hashtags.forEach(function(tag) {
      jtweet.hashtags.push(tag.text);
    });
  }
  jtweet.user = {};
  jtweet.user.id_str = ltweet.user.id_str;
  jtweet.user.name = ltweet.user.name;
  jtweet.user.screen_name = ltweet.user.screen_name;
  jtweet.user.description = ltweet.user.description;
  jtweet.user.created_at = ltweet.user.created_at;
  jtweet.user.time_zone = ltweet.user.time_zone;
  jtweet.user.name = ltweet.user.name;
  if (ltweet.place){
    jtweet.place = {};
    jtweet.place.id = ltweet.place.id;
    jtweet.place.name = ltweet.place.name;
    jtweet.place.country_code = ltweet.place.country_code;
    jtweet.place.country = ltweet.place.country;
  }
  jtweet.lang = ltweet.lang;
  jtweet.filter_level = ltweet.filter_level;
  jtweet.retweeted = ltweet.retweeted;
  jtweet.favorited = ltweet.favorited;
  var t = new Tweet(jtweet);
  var buf = t.encode();
  return conv(buf, { in:'buffer', out:'hex' });
}
