var kafka = require('kafka-node');

var topic = 'twitter-raw';

var consumer = new kafka.Consumer(new kafka.Client(), [{topic: topic, offset: 0}], {fromOffset: true, "consumer.timeout.ms" : 3000});
var libredis = require("redis");
var redis = libredis.createClient();

redis.flushdb();

consumer.on('message', function(message){
  var tweet = JSON.parse(message.value);
  var tag = {};
  for(tag of tweet.entities.hashtags){
    redis.zincrby("hashtags", 1, tag.text.toUpperCase());
    console.log("[Redis] ("+Date.now()/1+") Recorded tweet with tag: " + tag.text);
  }
  var time_zone = "(None)";
  if (tweet.user.time_zone){ time_zone = tweet.user.time_zone; }
  redis.zincrby("time_zones", 1, time_zone.toUpperCase());
  redis.zincrby("locations", 1, tweet.user.location);
});
