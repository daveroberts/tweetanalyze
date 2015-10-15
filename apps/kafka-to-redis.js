var kafka = require('kafka-node');
var _ = require('lodash');
var protobuf = require("protobufjs");

var topic = 'twitter-raw';
var builder = protobuf.loadProtoFile("tweet.proto");
var Tweet = builder.build("Tweet")
var User = builder.build("User")
var Place = builder.build("Place")

var consumer = new kafka.Consumer(new kafka.Client(), [{topic: topic, offset: 0}], {fromOffset: true, "consumer.timeout.ms" : 3000});
var libredis = require("redis");
var redis = libredis.createClient();

redis.flushdb();

consumer.on('message', function(message){
  console.log(message.value);
  process.exit(0);
  var tweet = Tweet.decode(message.value);
  for(hashtag of tweet.hashtags){
    redis.zincrby("hashtags", 1, hashtag);
    var range = _.range(1,hashtag.length+1);
    var parts = _.map(range,function(l){
      return hashtag.substring(0,l);
    });
    var part = "";
    for(part of parts){
      // dave -> parts ['d','da','dav']
      redis.zadd('compl', 0, part);
    }
    redis.zadd('compl',0,hashtag+"*")
    redis.sadd('hashtag-to-tweet-ids#'+hashtag, tweet.id);
    redis.set('tweet-id-to-text#'+tweet.id, tweet.text);
    console.log("[Redis] ("+Date.now()/1+") Recorded tweet with tag: " + hashtag);
  }
  var time_zone = "(None)";
  if (tweet.user.time_zone){ time_zone = tweet.user.time_zone; }
  redis.zincrby("time_zones", 1, time_zone.toUpperCase());
  redis.zincrby("locations", 1, tweet.user.location);
});
