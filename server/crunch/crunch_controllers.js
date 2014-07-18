"use strict";

var Crunch      = require('./crunch_model.js'),
    Q           = require('q'),
    nodemailer  = require('nodemailer'),
    Imap        = require('imap'),
    inspect     = require('util').inspect,
    Parser      = require('imap-parser'),
    parser      = new Parser(),
    xoauth2 = require('xoauth2'),
    mongoClient = require('mongodb').MongoClient,
    auth = require('../main/auth.js');

module.exports = exports = {

post: function (req, res, next) {
  if (req.session.user){
    var username = req.session.user;
    var buffer = '';
    req.on('data', function (data) {
      buffer += data.toString('utf8')
    });
    req.on('end', function () {
      buffer = buffer.split('###');
      var to = buffer[0];
      var subject = buffer[1];
      var message = buffer[2];

      mongoClient.connect("mongodb://localhost:27017/mailcrunch2", function (err, db) {
        if (err) {
          throw (err);
        }
        var collection = db.collection('users');
        collection.findOne({
          username: username
        }, function (err, results) {


          var smtpTransport = nodemailer.createTransport("SMTP", {
            service: "Gmail",
            auth: {
              XOAuth2: {
                user: results.username,
                clientId: auth.googleAuth.clientID,
                clientSecret: auth.googleAuth.clientSecret,
                refreshToken: results.refreshToken,
                accessToken: results.accessToken,
                timeout: 3600
              }
            }
          });
          var mailOptions = {
            from: results.username,
            to: to,
            subject: subject,
            text: message,
            html: "<b>" + message + "</b>"
          }
          smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
              console.log('error in smtp: ', error);
            } else {
              console.log("Message sent to: ", to);
            }
          });
        });
        res.end();
      });
    });
  }
},

 
postUpdate: function (req, res, next) {
  if (req.session.user){
    var username = req.session.user;
    var buffer = '';
    req.on('data', function (chunk) {
      buffer += chunk.toString('utf8');
    });
    req.on('end', function () {
        mongoClient.connect("mongodb://localhost:27017/mailcrunch2", function (err, db) {
          if (err) {
            throw (err);
          }
          var collection = db.collection('users');
          collection.findOne({
            username: username
          }, function (err, results) {
            var xoauth2Token;
            var xoauth2gen = xoauth2.createXOAuth2Generator({
              user: results.username,
              clientId: auth.googleAuth.clientID,
              clientSecret: auth.googleAuth.clientSecret,
              refreshToken: results.refreshToken
            });
            xoauth2gen.getToken(function (err, token) {
              if (err) {
                return console.log('xoauth error: ', err);
              }

              xoauth2Token = token;

              var imap = new Imap({
                xoauth2: xoauth2Token,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                authTimeout: 5000
              });

              var openInbox = function (cb) {
                imap.openBox('INBOX', false, cb);
              };
              imap.connect();
              imap.once('ready', function () {
                openInbox(function (err, box) {
                  if (err) throw err;
                  imap.search([buffer], function (err, results) {
                    if (err) throw err;
                    imap.addFlags(results, 'SEEN');
                  });
                });
              });

              imap.once('error', function (err) {
                console.log('imap error: ', err);
              });

              imap.once('end', function () {
                console.log('Connection ended');
                imap.end();
              });
            });
            res.end();
          });
        });
      });
    }
  }
};