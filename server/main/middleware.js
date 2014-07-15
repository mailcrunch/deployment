"use strict";

/*
 * MiddleWare for the entire app
*/
var fs         = require('fs'),
    nodemailer = require('nodemailer'),
    Imap       = require('imap'),
    inspect    = require('util').inspect,
    Parser     = require('imap-parser'),
    parser     = new Parser();

module.exports = exports = {

  emailSender: function(res, req, next){
    if (req.method === 'POST'){
      var buffer = '';
      res.on('data', function(data){
        buffer += data.toString('utf8')
      });
      res.on('end', function(){
        buffer = buffer.split('###');
        var to = buffer[1];
        var subject = buffer[2];
        var message = buffer[3];

        var smtpTransport = nodemailer.createTransport("SMTP",{
            service: "Gmail",
            auth: {
                user: "bizarroforrest",
                pass: "mailcrunch"
            }
        });
        var mailOptions = {
            from: "<bizarroforrest@gmail.com>", // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: message, // plaintext body
            html: "<b>" + message + "</b>" // html body
        }
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent: ");
            }
        });
      });
      req.end(buffer);
    }
  },
  emailGetter: function(req, res, next){
    if (req.method === 'GET'){
      var imap = new Imap({
        user: 'bizarroforrest',
        password: 'mailcrunch',
        host: 'imap.gmail.com',
        port: 993,
        tls: true
      });

      var openInbox = function(cb) {
        imap.openBox('INBOX', true, cb);
      }


      var headers;
      var allTheEmails = [];
      imap.once('ready', function() {
        openInbox(function(err, box) {
          if (err) throw err;
          imap.search([ 'UNSEEN' ], function(err, results){
            if (err) throw err;
             var fetched = imap.fetch(results, { struct: true, bodies: ['HEADER', 'TEXT'] });
             fetched.on('message', function(msg, seqno) {
              var bodyBuffer = '';
              var headerBuffer = '';
               msg.on('body', function(stream, info) {
                if (info.which === 'HEADER'){
                  stream.on('data', function(data){
                    headerBuffer += data;
                  });
                  stream.once('end', function(){
                    headerBuffer = Imap.parseHeader(headerBuffer);
                  })
                }
                if (info.which === 'TEXT'){
                  stream.on('data', function(chunk){
                    bodyBuffer += chunk;
                  });
                 }
               })
               msg.on('end', function(){
                var message = {body: bodyBuffer.toString('utf8'), headers: headerBuffer};
                allTheEmails.push(message);
               });
            });
            fetched.once('end', function(){
              res.end(JSON.stringify(allTheEmails));
            })
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

      imap.connect();
    }
  },

  logError: function (err, req, res, next) {
    if (err) {
      console.error(err);
      return next(err);
    }
    next();
  },

  handleError: function (err, req, res, next) {
    if (err) {
      res.send(500, err);
    }
    next();
  },
  cors: function (req, res, next) {
    res.header('Access-Controll-Allow-Origin', '*');
    res.header('Access-Controll-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Controll-Allow-Header', 'Cotent-tyope, Authorization');

    if (req.method === 'Options') {
      res.send(200);
    } else {
      return next();
    }
    // I think the passport authentication needs to go here
  }
};