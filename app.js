/**
 * Created by vgarg on 4/16/2015.
 */
var express = require('express');
var app = express();

var port = process.env.port || 8081;
var io = require('socket.io').listen(app.listen(port));
require('./config.js')(app, io);
require('./routes.js')(app, io);

console.log('Chat server started on port' + port);
