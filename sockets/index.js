"use strict";
(function (exports) {



  var express = require('express')
    , connect = require('connect')
    , mysql = require('mysql')
    , similar = require('./../stringsimilar')
    , sioCookieParser = express.cookieParser('one-and-half-cat')
    , Session = connect.middleware.session.Session
    , store = require('redis').createClient()
    , pub = require('redis').createClient()
    , sub = require('redis').createClient()
    , connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'seven',
        password : 'KSNyQb6HPbZMJRrX',
        database : 'ido'
    });

  exports.init = function (sio, sessionStore) {

    // ----------------------------------------------------
    // Connection
    //
    sio.on('connection', function (socket) {
        console.log('connection')
      var hs = socket.handshake
        , sessionID = hs.sessionID
        , watchedModels = [];

      // ----------------------------------------------------
      // Connect
      //
      socket.on('close status', function (data, callback) {
          connection.query('UPDATE `messages` SET `status` = 0 WHERE (`name` = "' + data.user + '") and  (`status` = 1)');
      });

      socket.on('send message', function (data, callback) {
          connection.query('INSERT ' +
              'INTO `messages` (`screen_name`, `name`, `message`, `date`, `status`) ' +
              'VALUES ("' + data.screen_name + '", "'+data.user+'", "'+data.message+'", "'+new Date().getTime()+'", 1)');
      });

      //-----------------------------------------------------
      // Search
      //
      function compare(a,b) {
         if (a.relativity > b.relativity)
             return -1;
         if (a.relativity < b.relativity)
             return 1;
         return 0;
      }

      socket.on('load messages', function (data, callback) {
          connection.query("SELECT `message`, `date` FROM `messages` "+
              "WHERE (status = 0) AND (`name` = '" + data.user + "')"+
              "ORDER BY `date` DESC", function (err, rows) {
                  if (err == null){
                      socket.emit('show messages',rows);
                  } else {
                      console.error(err);
                  }
              });
          connection.query("SELECT `message`, `date` FROM `messages` "+
              "WHERE (status = 1) AND (`name` = '" + data.user + "')"+
              "ORDER BY `date` DESC", function (err, rows) {
                  if (err == null){
                      if (rows.length > 0){
                          socket.emit('set status',rows[0]);
                      }
                  } else {
                      console.error(err);
                  }
              });
      });
      socket.on('search confederate', function (data, callback) {
          var relativity, results = [];
          connection.query("SELECT `screen_name`, `name`, `message`, `date` FROM `messages` " +
              "WHERE (`status` = 1) AND (`name` != '" + data.user + "')" +
              "ORDER BY `date` DESC",
              function(err, rows) {
              // And done with the connection.
                  if (err == null){
                      for (var i in rows){
                          relativity = similar.compare(data.message, rows[i].message);
                          if (relativity > 0){
                              results.push({
                                  name : rows[i].name,
                                  screen_name : rows[i].screen_name,
                                  message :  rows[i].message,
                                  date :  rows[i].date,
                                  relativity : relativity
                              });
                          }
                      }
                      results = results.sort(compare);
                      socket.emit('show results',results);
                  } else {
                      console.error(err);
                  }

              // Don't use the connection here, it has been returned to the pool.
          });
//          console.log('message!',data);
      });

    });

  };

}(exports));