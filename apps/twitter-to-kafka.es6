import TwitterReader from '../lib/twitter-reader'
import config from '../config/tweetanalyze';

var kafka = require('kafka-node');
var async = require('async');

var topic = 'twitter-raw';

var reader = new TwitterReader(config.twitter);
var producer = new kafka.Producer(new kafka.Client());
var async = require('async');

var io = require('socket.io')(8080);

var tweeting = true;

producer.on('ready', function(){
  reader.sample_stream(function(tweet){
    async.until(function(){
      return !tweeting;
    },function(next){
      handle_tweet(tweet);
      next()
    },function(){
      console.log("I'm all done");
    })
  });
});

var handle_tweet = function(tweet){
  if (tweet.text){
    producer.send([{topic: topic, messages: JSON.stringify(tweet)}], function(err, data){
      //console.log("[Ingest] ("+Date.now()/1+") Sent tweet to "+topic+"("+data[topic][0]+")");
    });
    //console.log("About to emit a fucking tweet");
    io.emit('tweet', tweet.text);
  }
};

setTimeout(function(){
  console.log("Shut down everything");
  tweeting = false;
},3000);

producer.on('error', function(err){
  console.log("Err: "+err);
});

