var pm2 = require('pm2');

pm2.connect(function() {
  pm2.start({
    script    : 'apps/webserver.js',
  }, function(err, apps) {
    pm2.disconnect();
  });
});

