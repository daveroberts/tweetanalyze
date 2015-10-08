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
    res.render('stats', {topTags: topTags})
  });
});

var server = app.listen(4000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

