# tweetanalyze

## To run

1. Install Kafka.  Run Kafka.  Create a topic: twitter-raw: `bin/kafka-topics.sh --create --topic twitter-raw --zookeeper localhost:2181 --partitions 1 --replication-factor 1`
2. Install Node.JS.  Put node and npm onto your $PATH
3. Install redis.  Run Redis server.
4. clone the repo.
5. Run `npm install` inside of the repo to get dependencies.
6. Copy config/tweetanalyze.js.example to config/tweetanalyze.js.  Popualte with your twitter credentials.
6. Run `node start.js`

## Todo

1. gulp doesn't quite serve the way I want it to.  When you change a file, the browser doesn't automatically reload.  The configuration is copied from elsewhere.  I may just do it manually.
2. Send updates to the client via socket.io.  Update page with React and RxJS.
3. The tasks in app.js are run when the application is run.  I would prefer to have them run on Apache Storm or Samza.  I was having some trouble getting this to work locally
4. Job scheduler for tasks in #3.  If Storm or Samza are used, this may not be necessary.
