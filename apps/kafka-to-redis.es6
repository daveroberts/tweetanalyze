var kafka = require('kafka-node');
var _ = require('lodash');

var topic = 'twitter-raw';

var consumer = new kafka.Consumer(new kafka.Client(), [{topic: topic, offset: 0}], {fromOffset: true, "consumer.timeout.ms" : 3000});
var libredis = require("redis");
var redis = libredis.createClient();

redis.flushdb();

consumer.on('message', function(message){
  var tweet = JSON.parse(message.value);
  var tag = {};
  for(tag of tweet.entities.hashtags){
    var hashtag = tag.text.toLowerCase();
    redis.zincrby("hashtags", 1, hashtag);
    var range = _.range(1,hashtag.length);
    var parts = _.map(range,function(l){
      return hashtag.substring(0,l);
    });
    var part = "";
    for(part of parts){
      // dave -> parts ['d','da','dav']
      redis.zadd('compl', 0, part);
    }
    redis.zadd('compl',0,hashtag+"*")
    console.log("[Redis] ("+Date.now()/1+") Recorded tweet with tag: " + hashtag);
  }
  var time_zone = "(None)";
  if (tweet.user.time_zone){ time_zone = tweet.user.time_zone; }
  redis.zincrby("time_zones", 1, time_zone.toUpperCase());
  redis.zincrby("locations", 1, tweet.user.location);
});
