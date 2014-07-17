"use strict";

var Crunch      = require('./crunch_model.js'),
    Q           = require('q'),
    nodemailer  = require('nodemailer'),
    Imap        = require('imap'),
    inspect     = require('util').inspect,
    Parser      = require('imap-parser'),
    parser      = new Parser();

module.exports = exports = {
  get: function (req, res, next) {
    var $promise = Q.nbind(Crunch.find, Crunch);
    $promise()
      .then(function (crunch) {
        res.json(crunch);
      })
       .fail(function (reason) {
        next(reason);
      });
  },

  post: function (req, res, next) {

    var buffer = '';
    req.on('data', function(data){
      buffer += data.toString('utf8')
    });
    req.on('end', function(){
      buffer = buffer.split('###');
      var to = buffer[0];
      var subject = buffer[1];
      var message = buffer[2];

      var smtpTransport = nodemailer.createTransport("SMTP",{
          service: "Gmail",
          auth: {
            XOAuth2: {
              user: // Get from DB,
              clientId: // Get from DB,
              clientSecret: // Get from DB,
              refreshToken: // Get from DB,
              accessToken: // Get from DB,
              timeout: 3600
            }
          }
      });
      var mailOptions = {
          from: // Get user email from DB, 
          to: to, 
          subject: subject, 
          text: message, 
          html: "<b>" + message + "</b>" 
      }
      smtpTransport.sendMail(mailOptions, function(error, response){
          if(error){
              console.log(error);
          }else{
              console.log("Message sent to: ", to);
          }
      });
    });
    res.end();
  },

  postUpdate: function(req, res, next){
    var buffer = '';
    req.on('data', function(chunk){
      buffer += chunk.toString('utf8');
    });
    req.on('end', function(){
      var xouath2Token;
      var xoauth2gen = xoauth2.createXOAuth2Generator({
          user: // get this info from DB,
          clientId: // DB,
          clientSecret: // DB,
          refreshToken: // DB
      });
      xoauth2gen.getToken(function(err, token){
          if(err){
              return console.log(err);
          }
          console.log("AUTH XOAUTH2 " + token);
          xoauth2Token = token;
      });
      var imap = new Imap({
        xoauth2: xoauth2Token,
        host: 'imap.gmail.com',
        port: 993,
        tls: true
      });
      var openInbox = function(cb) {
        imap.openBox('INBOX', false, cb);
      };
      imap.connect();
      imap.once('ready', function() {
        openInbox(function(err, box) {
          if (err) throw err;
          imap.search([ buffer ], function(err, results){
            if (err) throw err;
            imap.addFlags(results, 'SEEN');
          });
        });
      });
        
      imap.once('error', function(err) {
        console.log(err);
      });

      imap.once('end', function() {
        console.log('Connection ended');
        imap.end();
      });
    });
    res.end();
  }
};