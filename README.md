# tweetanalyze

## To run

1. Install Kafka.  Run Kafka.  Create a topic: twitter-raw: `bin/kafka-topics.sh --create --topic twitter-raw --zookeeper localhost:2181 --partitions 1 --replication-factor 1`
2. Install Node.JS.  Put node and npm onto your $PATH
3. Install redis.  Run Redis server.
4. clone the repo.
5. Run `npm install` inside of the repo to get dependencies.
6. Copy config/tweetanalyze.js.example to config/tweetanalyze.js.  Popualte with your twitter credentials.
6. Run `node start.js`

## Done

1. The sub processes are spawned using pm2, and you can control them in the web application.

## Todo

1. When you change a file, have the web server reload and browser reload(gulp and browser sync).
1. When you change a view, have the brower reload.
2. Send updates to the client via socket.io.  Update page with React and RxJS.
4. When a job fails to start or crashes, display the log in the web application
5. Be able to schedule jobs (process control) within the application.

## Maybe
3. The tasks in app.js are run when the application is run.  I would prefer to have them run on Apache Storm or Samza.  I was having some trouble getting this to work locally
