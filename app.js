"use strict";
var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    port = 1337;

var express = require('express'),
    mongoose = require('mongoose'),
    user = require('./models/user'),
    routes = require('./routes'),
    sockets = require('./sockets'),
    connect = require('express/node_modules/connect'),
    RedisStore = require('connect-redis')(express),
    sessionStore = new RedisStore(),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    port = 8088,
    sio;

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.static(__dirname + '/app'));
    app.use(express.cookieParser('one-and-half-cat'));
    app.use(express.session({
        secret: 'one-and-half-cat',
        key: 'express.sid',
        store: sessionStore
    }));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

routes.init(app);
mongoose.connect("127.0.0.1", "fripple", 27017);

app.listen(port);

//sio = require('socket.io').listen(server);
//sockets.init(sio, sessionStore);

console.log("Fripple started on port " + port);
