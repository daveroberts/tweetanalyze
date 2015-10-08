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

/*var offset = new kafka.Offset(new kafka.Client());
offset.fetch([
    { topic: topic, partition: 0, time: -1, maxNum: 1 }
], function (err, data) {
  var latest_offset = data['twitter-raw'][0][0];
  var offset2 = new kafka.Offset(new kafka.Client());
  offset2.fetch([{ topic: topic, partition: 0, time: -2, maxNum: 1 }
    ], function (err, data) {
    var current_offset = data['twitter-raw'][0][0];
    console.log("Current: " + current_offset + " Latest: " + latest_offset);

  /*consumer.on('message', function(message){
    var tweet = JSON.parse(message.value);
    console.log("Current: " + message.offset + " Latest: " + latest_offset);
    if (message.offset == latest_offset){
      console.log("My work is done here");
      process.exit();
    }/*
  });
});*/

/*
   redis.zrevrange("hashtags", 0,9, "WITHSCORES", function(err, obj){
  var topTags = [];
  var len = obj.length, i=0;
  while (i < len){
    topTags.push([obj[i], obj[i+1]]);
    i = i + 2;
  }
  console.log(topTags);
});

redis.zrevrange("time_zones", 0,9, "WITHSCORES", function(err, obj){
  var topTags = [];
  var len = obj.length, i=0;
  while (i < len){
    topTags.push([obj[i], obj[i+1]]);
    i = i + 2;
  }
  console.log(topTags);
});

redis.zrevrange("locations", 0,9, "WITHSCORES", function(err, obj){
  var topTags = [];
  var len = obj.length, i=0;
  while (i < len){
    topTags.push([obj[i], obj[i+1]]);
    i = i + 2;
  }
  console.log(topTags);
});
*/
