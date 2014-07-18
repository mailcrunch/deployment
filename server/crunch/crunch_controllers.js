
"use strict";

var nodemailer  = require('nodemailer'), // Nodemailer is what we use to transmit email via SMTP. See https://github.com/andris9/Nodemailer
    Imap        = require('imap'),
    xoauth2     = require('xoauth2'),
    mongoClient = require('mongodb').MongoClient,
    auth        = require('../main/auth.js');


module.exports = exports = {

  post: function (req, res, next) {
    if (req.session.user){
      var username = req.session.user;

      var buffer = '';
      req.on('data', function (data) {
        buffer += data.toString('utf8')
      });
      req.on('end', function () {
        // The buffer object will be the formatted string from client/crunch/crunch.js
        buffer = buffer.split('###');
        var to = buffer[0];
        var subject = buffer[1];
        var message = buffer[2];

        mongoClient.connect(auth.dbAuth.dbUri, function (err, db) {
          if (err) {
            throw (err);
          }
          var collection = db.collection('users');
          collection.findOne({
            username: username
          }, function (err, results) {

            // Create an SMTP transport with Nodemailer, with the given options
            var smtpTransport = nodemailer.createTransport("SMTP", {
              service: "Gmail",
              // The authorization will be xoauth2, which nodemailer generates automatically
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
            // Build the email object to send
            var mailOptions = {
              from: results.username,
              to: to,
              subject: subject,
              text: message,
              html: "<b>" + message + "</b>"
            };
            // Send the email here
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


  // This function works the same was as the 'get' function in note/note_controllers.js
  // The differences are noted below
  markEmailAsRead: function (req, res, next) {
    if (req.session.user){
      var username = req.session.user;
      var buffer = '';
      req.on('data', function (chunk) {
        buffer += chunk.toString('utf8');
      });
      req.on('end', function () {
        mongoClient.connect(auth.dbAuth.dbUri, function (err, db) {
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

              // When we open the inbox this time, we want to set the 'read-only' param to false, so that we can update the email's flag
              var openInbox = function (cb) {
                imap.openBox('INBOX', false, cb);
              };
              imap.connect();
              imap.once('ready', function () {
                openInbox(function (err, box) {
                  if (err) throw err;
                  // We are only searching the inbox for the specific email we just sent
                  // This is contained in the buffer object
                  imap.search([buffer], function (err, results) {
                    if (err) throw err;
                    // This is where we are marking the email as 'read' or 'seen'
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