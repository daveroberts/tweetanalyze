var pm2 = require('pm2');
var express = require('express');
var app = express();
var _ = require('lodash');
var bodyParser = require('body-parser');
var libredis = require("redis");
var redis = libredis.createClient();

pm2.connect();
app.set('view engine', 'ejs');
app.use(bodyParser());

var apps = ['webserver', 'twitter-to-kafka', "kafka-to-redis"]

app.get('/', function (req, res) {
  pm2.list(function(err, list){
    var statuses = _.map(apps, function(a){
      var p_info = _.find(list, function(i){
        return i.name == a;
      });
      if (p_info){
        return {name: a, pid: p_info.pid};
      } else {
        return {name: a, pid: 0};
      }
    });
    res.render('index', {list: statuses})
  });
});

app.post('/stop', function(req, res){
  var name = req.body.name;
  pm2.stop(name, function(err, proc){
    res.redirect('/');
  });
});

app.post('/start', function(req, res){
  var name = req.body.name;
  pm2.start("./apps/"+name+".js", function(err, proc){
    res.redirect('/');
  });
});

app.get('/stats', function(req, res){
  redis.zrevrange("hashtags", 0,9, "WITHSCORES", function(err, obj){
    var topTags = [];
    var len = obj.length, i=0;
    while (i < len){
      topTags.push([obj[i], obj[i+1]]);
      i = i + 2;
    }
    redis.sinter("", function(err, intersection){
      res.render('stats', {topTags: topTags, allDays: intersection})
    });
  });
});

var hashtag = "";
app.param('hashtag', function (req, res, next, value) {
  hashtag = value;
  next();
})

var async = require('async');

app.get("/tag/:hashtag", function(req, res){
  redis.smembers('hashtag-to-tweet-ids#'+hashtag, function(err, tweetids){
    var keys = _.map(tweetids, function(id){return "tweet-id-to-text#"+id;});
    async.map(keys, function(key, cb){
      redis.get(key, function(err, val){
        cb(null, val);
      });
    }, function(err, results){
      res.send(JSON.stringify(results));
    });
  });
});

app.get('/suggestions', function(req, res){
  var max = 10;
  var rangelen = 50; // keep this under MTU
  var q = req.query.q;
  console.log("q: "+q);
  var suggestions = [];
  var nomore = false;
  redis.zrank('compl', q, function(err,rank){
    if (!rank){ res.send(JSON.stringify(suggestions)); return; }
    async.until(function(){
      // until you return true here
      return (nomore) || (suggestions.length >= max);
    },function(done){
      // this code is called again and again
      redis.zrange('compl',rank,rank+rangelen-1, function(err,range){
        console.log("Err: "+err);
        if (err){
          res.send("[]");
          return;
        }
        rank = rank + rangelen;
        for(i in range){
          console.log("i: "+i+" range[i]: "+range[i]+" index1: "+range[i].indexOf(q)+" index2: "+range[i].indexOf("*"));
          if(range[i].indexOf(q) == 0){
            if (range[i].indexOf("*") >= 0){
              var suggest = range[i].substring(0,range[i].length-1);
              suggestions.push(suggest);
            }
          } else {
            nomore = true;
          }
        }
        done();
      });
    },function(){
      // you have access to the final stuff here
      res.send(JSON.stringify(suggestions));
      return;
    });
  });
});

var server = app.listen(4000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

