"use strict";

var Imap        = require('imap'), // Imap for the getting of emails. See https://github.com/mscdex/node-imap
    mongoClient = require('mongodb').MongoClient,
    ObjectId = require('mongodb').ObjectID, //require this to use mongodb's ObjectID function for retrieval of BSON encoded ids
    xoauth2 = require('xoauth2'), // xoauth2 is needed for accessing user's email. See https://developers.google.com/gmail/xoauth2_protocol
    auth = require('../main/auth.js'); // For importing the clientId and secret for getting emails


//set up initial db configuration and indexes

mongoClient.connect('mongodb://localhost:27017/mailcrunch2', function(err,db){
  db.createCollection('emails',function(err,collection) {});
  db.createCollection('users',function(err,collection){});
  db.createIndex('users', {username: 1}, {unique: true}, function(err,res){});
  db.createIndex('emails',{headersUniqHack:1}, {unique:true},function(err,res){});
  db.createIndex('emails',{tag:1},{unique:false},function(err,res){});
  db.createIndex('emails',{createdAt:1},{unique:false},function(err,res){});
  db.close();
});

module.exports = exports = {
  getLatestEmailsForDB: function(req,res,next){
    if (req.session.user){
      var username = req.session.user;
      mongoClient.connect('mongodb://localhost:27017/mailcrunch2', function(err,db){
        if (err) throw err;
        var collection = db.collection('users');
        collection.findOne({username: username}, function(err,results){
          var xoauth2Token;
          var xoauth2gen = xoauth.createXOAuth2Generator({
            user: results.username,
            clientId: auth.googleAuth.clientID,
            clientSecret: auth.googleAuth.clientSecret,
            refreshToken: results.refreshToken
          });
          xoauth2gen.getToken(function(err,token){
            if(err){
              return console.log('xoauth error: ', err);
            }
            xoauth2Token = token;
            var imap = new Imap({
              xoauth2: xoauth2Token,
              host: 'imap.gmail.com', //need to support other email clients in future...
              port: 993,
              tls: true,
              authTimeout:5000,
            });
            var openInbox = function(cb){
              imap.openBox('INBOX', true, cb);
            }
            var headers;
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
                    var UID;
                    msg.on('body', function(stream, info) {
                      if (info.which === 'HEADER'){
                        stream.on('data', function(data){
                          headerBuffer += data;
                        });
                        stream.once('end', function(){
                          headerBuffer = Imap.parseHeader(headerBuffer);
                        });
                      }
                      if (info.which === 'TEXT'){
                        stream.on('data', function(chunk){
                          bodyBuffer += chunk;
                        });
                      }
                    });
                    msg.once('attributes', function(attrs){
                      UID = attrs.uid;
                    });
                    msg.on('end', function(){

                      var message = {body: bodyBuffer.toString('utf8'), headers: headerBuffer, uid: UID};
                      //add individual email to database with appropriate tags if it is not currently in db
                
                      var collection = db.collection('emails');
                      message.tag = 'unsorted';
                      message.username = username;
                      message.createdAt = message.headers['date'][0];
                      //this line creates a unique id for the email based on the user's username and the message-id which should be unique
                      //for future versions might need to refactor as message-id might not be unique.
                      message.headersUniqHack = message.username + message.headers['message-id'][0].split('@')[0].slice(1);
                      collection.update({headersUniqHack: message.headersUniqHack}, message, {upsert:false}, function(err,results){
                        if (err){
                          console.log(err);
                        }
                      });
                    
                    });
                  });
                  fetched.once('end', function(){
                    res.end();
                    imap.end();
                  });
                });
              });
            }); 
            imap.once('error', function(err) {
              console.log(err);
            });

            imap.once('end', function() {
              console.log('Connection ended');
              imap.end();
              res.end();
            });               
          });
        });
      });
    }
    else{
      res.redirect('/#/login');
    }
  },
  getUnsortedEmailsForClient: function(req,res,next){
    if (req.session.user){
      mongoClient.connect("mongodb://localhost:27017/mailcrunch2", function(err, db) {
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
    else{
      res.redirect('/#/login'); 
    }
  },
  get: function (req, res, next) {
    try {
      // Connect to database, so that we can access information stored on login to query user's email
      mongoClient.connect("mongodb://localhost:27017/mailcrunch2", function(err, db) {
        if(err) { throw (err); }
        var collection = db.collection('users');
          collection.findOne({username: 'bizarroforrest@gmail.com'}, function(err,results){
            var xoauth2Token;
            // This generates an xoauth2 token for getting emails
            var xoauth2gen = xoauth2.createXOAuth2Generator({
              user: results.username,
              clientId: auth.googleAuth.clientID,
              clientSecret: auth.googleAuth.clientSecret,
              refreshToken: results.refreshToken
            });
            // This gets the xoauth2 token
            xoauth2gen.getToken(function(err, token){
            if(err){
              return console.log('xoauth error: ', err);
            }
            // Assign the token to the xoauth2 variable to use below
            xoauth2Token = token;
            
            // Setup Imap connection
            var imap = new Imap({
              xoauth2: xoauth2Token,
              host: 'imap.gmail.com',
              port: 993,
              tls: true,
              authTimeout: 5000
            });

            // Open the specified mailbox with read-only access set to true
            // This is not where we want to mark the emails as 'read'
            var openInbox = function(cb) {
              imap.openBox('INBOX', true, cb);
            };
            var headers;
            // Establish Imap connection with above credentials
            imap.connect();
            // Upon successful connection a 'ready' event is fired
            imap.once('ready', function() {
              openInbox(function(err, box) {
                if (err) throw err;
                // This is where we search the inbox for all unread messages
                imap.search([ 'UNSEEN' ], function(err, results){
                  if (err) throw err;
                  // The sought messages now need to be fetched one by one.
                  // We need to specify the Headers and Text bodies in order to retrieve both
                  var fetched = imap.fetch(results, { struct: true, bodies: ['HEADER', 'TEXT'] });
                    // Upon successful fetch of a message, a 'message' event is fired
                    fetched.on('message', function(msg, seqno) {
                    // At this point it works like Node
                    // When a msg is recieved it emits 'body', 'attributes' and 'end' events
                    var bodyBuffer = '';
                    var headerBuffer = '';
                    var UID;
                    msg.on('body', function(stream, info) {
                      // This grabs the headers
                      if (info.which === 'HEADER'){
                        stream.on('data', function(data){
                          headerBuffer += data;
                        });
                        stream.once('end', function(){
                          headerBuffer = Imap.parseHeader(headerBuffer);
                        });
                      }
                      // This grabs the message body.
                      // The message body is not always as clean as you might want it to be. That is why we have to parse it in client/common/factories.js
                      if (info.which === 'TEXT'){
                        stream.on('data', function(chunk){
                          bodyBuffer += chunk;
                        });
                      }
                    });
                    // This grabs the UID of the email, which we will need later to retrieve this particular email to mark as 'read'
                    // The use of 'once' vs 'on' is unclear from node-imap docs
                    msg.once('attributes', function(attrs){
                      UID = attrs.uid;
                    });
                    msg.on('end', function(){

                      var message = {body: bodyBuffer.toString('utf8'), headers: headerBuffer, uid: UID};
                      
                      //add individual email to database with appropriate tags if it is not currently in db
                      var collection = db.collection('emails');
                      message.tag = 'unsorted';
                      message.username = 'bizarroForrest';
                      message.createdAt = message.headers['date'][0];
                      //this line creates a unique id for the email based on the user's username and the message-id which should be unique
                      //for future versions might need to refactor as message-id might not be unique.
                      message.headersUniqHack = message.username + message.headers['message-id'][0].split('@')[0].slice(1);
                      collection.update({headersUniqHack: message.headersUniqHack}, message, {upsert:false}, function(err,results){
                        if (err){
                          console.log(err);
                        }
                      });
                    
                    });
                  });
                  fetched.once('end', function(){
                    //connect to database and pull out all the emails
                    //eventually need to pipe in username from client.
                    var collection = db.collection('emails');
                    collection.find({username:'bizarroForrest', tag:'unsorted'}).toArray(function(err, emails){
                      if (err) {
                        console.log(err);
                        throw (err);
                      }
                      // Send emails back to factory
                      res.end(JSON.stringify(emails));
                    });
                    imap.end();
                  });
                });
              });
            });

            // If the imap connection emits an 'error' event, it logs in the server console
            imap.once('error', function(err) {
              console.log(err);
            });

            // On the end of the imap connection we have to close the imap and res connections
            imap.once('end', function() {
              console.log('Connection ended');
              imap.end();
              res.end();
            });
          });

        });
      });
    }

    catch (e){
      console.log(e);
    }
  },

  getSortedInbox: function(req,res,next){
    try {
      //returns array fo sorted emails from server-db
      //eventually should also sort by date as secondary?
      //also need to replace username with active user... and add in auth
      mongoClient.connect("mongodb://localhost:27017/mailcrunch2", function(err, db) {
        if (err) throw err;
        var collection = db.collection('emails');
        collection.find({username:'bizarroForrest', tag:'sorted'}).sort({bucket:1}).toArray(function(err,emails){
          if (err) throw err;
          res.end(JSON.stringify(emails));
        });
      });
    }
    catch (e){
      console.log(e);
    }
  },

  //This function updates the email Tag (and optionally a bucket) on an email
  //TODO FOR SECURITY: make sure username is same on email as current user before allowing user to update tag (avoid attacks!!!)
  updateEmailTag: function(req,res,next){
   var buffer = '';
    req.on('data', function(data){
      buffer += data.toString('utf8')
    });
    req.on('end', function(){
      console.log(buffer);
      buffer = buffer.split('###');
      var id = buffer[0];
      var tag = buffer[1];
      var bucket = buffer[2];
      try {
        mongoClient.connect("mongodb://localhost:27017/mailcrunch2", function(err, db) {
          if(err) { throw err; }
          var collection = db.collection('emails');   
          collection.update({_id:new ObjectId(id)}, {$set: {tag:tag, bucket:bucket}}, function(err, res){
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
  },
};