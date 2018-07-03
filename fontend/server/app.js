'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

//Set redis Server on port
process.env.REDIS_IP = '210.211.125.76';
process.env.REDIS_PORT = 6379;

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var redis = require('redis');
var schedule = require('node-schedule');




// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
  }
);
// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: true,
  path: '/socket.io-client'
});


require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);
require('../node_amqplib/lib_main');
require('./config/crontab')(schedule);

server.listen(config.port, config.ip, function () {
  console.log('----------------------------------------------------------------------');
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;