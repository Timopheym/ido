"use strict";

var mongoose = require('mongoose'),
    User = require('../models/user'),
    sys = require('util'),
    sockets = require('./../sockets'),
    sio = require('socket.io').listen(3003),
    oauth = require('oauth'),
    twitter = require('ntwitter'),
    twit = {};
(function (exports) {
    exports.init = function (app) {

        sockets.init(sio, null, twit);
        app.post('/register', function (req, res) {

            var name  = req.body.name,
                email = req.body.email,
                pass  = req.body.password,
                pass2 = req.body.password_repeat,
                u = new User();
            //TODO: Hash test
            //TODO: user with same mail
            if (pass2 === pass) {
                u.name = name;
                u.email = email;
                u.password = pass;
                u.save(function (err) {
                    if (!err) {
                        console.log('user ' + name + ' has been registred, error: ');
                        req.session.username = name;
                        //TODO: Response url without register
                        res.render('main', {
                            'title': '.:Teempla:.'
                        });
                    } else {
                        var e = new Error('Error while registration' + err);
                        e.name = "Registration error";
                        throw e;
                    }
                });
            }

        });

        app.post('/login', function (req, res) {
            var email = req.body.email,
                pass = req.body.password,
                User = mongoose.model('User');
            console.log('Login user', email, 'With password', pass);
            User.findOne({email: email}, function (err, usr) {
                if (usr !== null && usr.password === pass) {
                    req.session.username = usr.name;
                    res.render('main', {
                        'title': '.:Teempla:.'
                    });
                }
                else {
                    res.render('index', {
                        'title': 'Fripple: Welcome.'
                    });
                }
            });
        });

        app.get('/logout', function (req, res) {
            req.session.username = undefined;
            res.render('index', {
                'title': 'Fripple: Welcome.'
            });
        });

        app.get('/', function (req, res) {

            if (req.session.username !== undefined)
            {
                res.render('main', {
                    'title': '.:I am doing:.',
                    'twitter' : req.session.twitter_data
                });
            }
            else {
                res.render('index', {
                    'title': '.:I am donig: Welcome:.'
                });
            }
        });

        app.get('/register', function (req, res) {
            //TODO: Secret cache test
            console.log(req.session,'<---session');
            if (req.session.username !== undefined)
            {
                res.render('main', {
                    'title': '.:Fripple:.'
                });
            }
            else {
                res.render('registration', {
                    'title': 'Fripple: Registration.'
                });
            }
        });




        var _twitterConsumerKey = process.env['TWITTER_CONSUMER_KEY'] || "hqQkeI0U44e1VUiznU17g";
        var _twitterConsumerSecret = process.env['TWITTER_CONSUMER_SECRET'] || "oCTgrQUahJkc6H3cfaMYtrWVaUuX82opkB8cRKBtj0I";

        console.log("_twitterConsumerKey: %s and _twitterConsumerSecret %s", _twitterConsumerKey, _twitterConsumerSecret);

        function consumer() {
            return new oauth.OAuth(
                "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
                _twitterConsumerKey, _twitterConsumerSecret, "1.0A", "http://fripple.ru:8088/sessions/callback", "HMAC-SHA1");
        }

        app.get('/sessions/connect', function(req, res){
            consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
                if (error) {
                    res.send("Error getting OAuth request token : " + sys.inspect(error), 500);
                } else {
                    req.session.oauthRequestToken = oauthToken;
                    req.session.oauthRequestTokenSecret = oauthTokenSecret;
                    res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);
                }
            });
        });

        app.get('/sessions/callback', function(req, res){
            sys.puts(">>"+req.session.oauthRequestToken);
            sys.puts(">>"+req.session.oauthRequestTokenSecret);
            sys.puts(">>"+req.query.oauth_verifier);
            consumer().getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier,
                function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
                if (error) {
                    res.send("Error getting OAuth access token : " + sys.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
                } else {
                    req.session.oauthAccessToken = oauthAccessToken;
                    req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
                    // Right here is where we would write out some nice user stuff
                    consumer().get(
                        "http://api.twitter.com/1.1/account/verify_credentials.json",
                        req.session.oauthAccessToken,
                        req.session.oauthAccessTokenSecret,
                        function (error, data, response) {
                            if (error) {
                                res.send("Error getting twitter screen name : " + sys.inspect(error), 500);
                            } else {
                                console.log("data is %j", data);
                                data = JSON.parse(data);
                                twit = new twitter({
                                    consumer_key: '"hqQkeI0U44e1VUiznU17g"',
                                    consumer_secret: '"oCTgrQUahJkc6H3cfaMYtrWVaUuX82opkB8cRKBtj0I"',
                                    access_token_key: req.session.oauthAccessToken,
                                    access_token_secret: req.session.oauthAccessTokenSecret
                                })
                                req.session.username = data["screen_name"];
                                req.session.name = data["name"];
                                req.session.twitter_data = data;
                                res.redirect('/');
                            }
                        });
                }
            });
        });

        app.get('*', function (req, res) {
            res.render('404', {
                'title': 'Page not found'
            });
        })
    };

}(exports));