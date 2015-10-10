import TwitterReader from '../lib/twitter-reader'
import config from '../config/tweetanalyze';

var kafka = require('kafka-node');

var topic = 'twitter-raw';

var reader = new TwitterReader(config.twitter);
var producer = new kafka.Producer(new kafka.Client());
producer.on('ready', function(){
  reader.sample_stream(function(tweet){
    if (tweet.text){
      producer.send([{topic: topic, messages: JSON.stringify(tweet)}], function(err, data){
        console.log("[Ingest] ("+Date.now()/1+") Sent tweet to "+topic+"("+data[topic][0]+")");
      });
    }
  });
});

producer.on('error', function(err){
  console.log("Err: "+err);
});
