"use strict";

var Imap        = require('imap'), // Imap for the getting of emails. See https://github.com/mscdex/node-imap
    mongoClient = require('mongodb').MongoClient,
    ObjectId    = require('mongodb').ObjectID, //require this to use mongodb's ObjectID function for retrieval of BSON encoded ids
    xoauth2     = require('xoauth2'), // xoauth2 is needed for accessing user's email. See https://developers.google.com/gmail/xoauth2_protocol
    auth        = require('../main/auth.js'), // For importing the clientId and secret for getting emails
    MailParser  = require("mailparser").MailParser; //For parsing the messages returned to avoid doing that manually client-side


//set up initial db configuration and indexes
mongoClient.connect(auth.dbAuth.dbUri, function(err,db) {
  db.createCollection('emails',function(err,collection) {});
  db.createCollection('users',function(err,collection){});
  db.createIndex('users', {username: 1}, {unique: true}, function(err,res){});
  db.createIndex('emails',{headersUniqHack:1}, {unique:true},function(err,res){});
  db.createIndex('emails',{tag:1},{unique:false},function(err,res){});
  db.createIndex('emails',{createdAt:1},{unique:false},function(err,res){});
  db.close();
});

module.exports = exports = {
  login: function(req, res, next) {
    if (req.session.user === undefined){
      res.end('false')
    } else {
      res.end('true')
    }
  },
  
  getUnsortedEmailsForClient: function(req,res,next) {
    if (!req.session.user){
      res.redirect('/');
    } else {
      mongoClient.connect(auth.dbAuth.dbUri, function(err, db) {
        if(err) { throw (err); }
        var collection = db.collection('emails');
        collection.find({username:req.session.user, tag:'unsorted'}).toArray(function(err, emails){
          if (err) {
            console.log(err);
            throw (err);
          }
          res.end(JSON.stringify(emails));
        });
      });
    }
  },
  get: function (req, res, next) {
    if (!req.session.user){
      res.redirect('/');
    } else {
      var username = req.session.user;
      mongoClient.connect(auth.dbAuth.dbUri, function(err,db){
        if (err) throw err;
        var collection = db.collection('users');
        collection.findOne({username:username}, function(err,results){
            var imap = new Imap({
              username: 'bizarroForrest',
              password: 'mailcrunch',
              host: 'imap.gmail.com',
              port: 993,
              tls: true,
              authTimeout: 20000
            });

            // Open the specified mailbox with read-only access set to true
            // This is not where we want to mark the emails as 'read'

            var openInbox = function(cb){
              imap.openBox('INBOX', true, cb);
            };
            var headers;
            // Establish Imap connection with above credentials
            imap.connect();
            // Upon successful connection a 'ready' event is fired
            imap.once('ready', function(){
              openInbox(function(err,box){
                if (err) console.log(err);
                // This is where we search the inbox for all unread messages
                imap.search(['UNSEEN'], function(err,results){
                  if (err) console.log(err);
                  // The sought messages now need to be fetched one by one.
                  // We need to specify the Headers and Text bodies in order to retrieve both
                  if (results.length === 0){
                    res.end('no messages today');
                    imap.end();
                    return;
                  }
                  var fetched = imap.fetch(results,{ struct: true, bodies: '' });

                  // Upon successful fetch of a message, a 'message' event is fired  
                  fetched.on('message', function(msg,seqno){
                    var parser = new MailParser({showAttachmentLinks: true});

                    var currentParsedEmail;

                    var buffer = '';
                    var UID;
                    // At this point it works like Node
                    // When a msg is recieved it emits 'body', 'attributes' and 'end' events
                    
                    msg.on('body', function(stream, info) {

                      stream.on('data', function(chunk) {
                        buffer += chunk.toString('utf8');
                      });
                    });
                    // This grabs the UID of the email, which we will need later to retrieve this particular email to mark as 'read'
                    // The use of 'once' vs 'on' is unclear from node-imap docs
                    msg.on('attributes', function(attrs){
                      UID = attrs.uid;
                    });

                    msg.on('end', function(){
                       parser.write(buffer);
                       parser.end();
                     });

                    parser.on('end', function(mailObj){
                      currentParsedEmail = mailObj;
                      var message = {body: currentParsedEmail.html, headers: currentParsedEmail.headers, uid: UID};

                      //add individual email to database with appropriate tags if it is not currently in db

                      var collection = db.collection('emails');
                      message.tag = 'unsorted';
                      message.username = username;
                      message.createdAt = message.headers.date;
                      //this line creates a unique id for the email based on the user's username and the message-id which should be unique
                      //for future versions might need to refactor as message-id might not be unique.
                      message.headersUniqHack = message.username + message.headers['message-id'].split('@')[0].slice(1);
                      collection.insert( message, {w:1}, function(err,results){
                        if (err){
                          console.log(err);
                        }        
                      });    
                    });
                  });
                  //connect to database and pull out all the emails
                  fetched.once('end', function(){
                    var collection = db.collection('emails');
                    collection.find({username:username,tag:'unsorted'}).toArray(function(err,emails){
                      if (err) console.log(err);
                      if (emails.length > 0){
                        console.log('length of emails: ', emails.length);
                        res.end(JSON.stringify(emails));
                      } else {
                        res.end('no messages today');
                      }
                      imap.end();
                    });
                  });
                });
              });

              imap.once('error', function(err) {
                console.log('imap err  ', err);
              });

              imap.once('end', function() {
                console.log('Connection ended');
                imap.end();
              });
            });
          });
        });
      });
    }
  },

  getSortedInbox: function(req,res,next){
    if (!req.session.user){
      res.redirect('/#/public/login');
    } else {
      var username = req.session.user;
      try {
        //returns array fo sorted emails from server-db
        //eventually should also sort by date as secondary?
        //also need to replace username with active user... and add in auth
        mongoClient.connect(auth.dbAuth.dbUri, function(err, db) {
          if (err) throw err;
          var collection = db.collection('emails');
          collection.find({username:username, tag:'sorted'}).sort({bucket:1}).toArray(function(err,emails){
            if (err) throw err;
            res.end(JSON.stringify(emails));
          });
        });
      }
      catch (e){
        console.log(e);
      }
    }
  },

  //This function updates the email Tag (and optionally a bucket) on an email
  updateEmailTag: function(req,res,next) {
   if (!req.session.user){
    res.redirect('/#/public/login');
   } else {
     var username = req.session.user;
     var buffer = '';
      req.on('data', function(data){
        buffer += data.toString('utf8');
      });
      req.on('end', function() {
        buffer = buffer.split('###');
        var id = buffer[0];
        var tag = buffer[1];
        var bucket = buffer[2];
        try {
          mongoClient.connect(auth.dbAuth.dbUri, function(err, db) {
            if(err) { throw err; }
            var collection = db.collection('emails');   
            //update items with matching id (with checking username for security!)
            collection.update({_id:new ObjectId(id), username:username}, {$set: {tag:tag, bucket:bucket}}, function(err, res) {
              if (err){
                throw err;
              }
              console.log(res);
              console.log('id ' + id + '###' + tag);
            });
          });
        }
        catch (e){
          console.log(e);
        }
      });
      res.end();
    }
  }
};