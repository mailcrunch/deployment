"use strict";

/*
 * MiddleWare for the entire app
*/
var fs         = require('fs'),
    nodemailer = require('nodemailer'),
    Imap       = require('imap'),
    inspect    = require('util').inspect,
    Parser     = require('imap-parser'),
    parser     = new Parser(),
    mongoClient = require('mongodb').MongoClient;

mongoClient.connect('mongodb://localhost:27017/mailcrunch2', function(err,db){
  db.createCollection('emails',function(err,collection) {});
  db.createCollection('users',function(err,collection){});
  db.createIndex('users', {username: 1}, {unique: true}, function(err,res){});
  db.createIndex('emails',{headersUniqHack:1}, {unique:true},function(err,res){});
  db.createIndex('emails',{tag:1},{unique:false},function(err,res){});
  db.close();
  // db.createIndex('emails',{username:1}, {unique:false}, function(err,res){});
});

module.exports = exports = {

  emailSender: function(res, req, next){
    
  },
  emailGetterAndSender: function(req, res, next){
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

      imap.connect();

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
                mongoClient.connect("mongodb://localhost:27017/mailcrunch2", function(err, db) {
                  if(err) { return console.dir(err); }
                  var collection = db.collection('emails');
                  message.tag = 'unsorted';
                  message.username = 'bizarroForrest';
                  message.headersUniqHack = message.username + message.headers['message-id'][0].split('@')[0].slice(1);
                  collection.insert(message, {w:1}, function(err,results){
                    if (err){
                      console.log(err);
                    }
                    else
                      console.log(results);
                  });
                });
               });
            });
            fetched.once('end', function(){
              console.log(allTheEmails);

              mongoClient.connect("mongodb://localhost:27017/mailcrunch2", function(err, db) {
                if(err) { return console.dir(err); }
                var collection = db.collection('emails');
                collection.find({username:'bizarroForrest'}).toArray(function(err, res){
                  if (err) {
                    console.log(err);
                    throw (err);
                  }
                  console.log('foo:::: ' + JSON.stringify(res));
                });
              });
              res.end(JSON.stringify(allTheEmails));
              imap.end();
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
        res.end()
      });
    } else if (req.method === 'POST'){
      var buffer = '';
      req.on('data', function(data){
        buffer += data.toString('utf8')
      });
      req.on('end', function(){
        buffer = buffer.split('###');
        var to = buffer[1];
        var subject = buffer[2];
        var message = buffer[3];
        console.log(to);

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
      res.end(buffer);
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
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Header', 'Content-type, Authorization');

    if (req.method === 'Options') {
      res.send(200);
    } else {
      return next();
    }
    // I think the passport authentication needs to go here
  }
};