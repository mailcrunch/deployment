"use strict";

var Note        = require('./note_model.js'),
    Q           = require('q'),
    Imap        = require('imap'),
    inspect     = require('util').inspect,
    Parser      = require('imap-parser'),
    parser      = new Parser(),
    mongoClient = require('mongodb').MongoClient,
    //require this to use mongodb's ObjectID function for retrieval of BSON encoded ids
    ObjectId = require('mongodb').ObjectID;


//set up initial db configuration and indexes
mongoClient.connect('mongodb://localhost:27017/mailcrunch2', function(err,db){
  db.createCollection('emails',function(err,collection) {});
  db.createCollection('users',function(err,collection){});
  db.createIndex('users', {username: 1}, {unique: true}, function(err,res){});
  db.createIndex('emails',{headersUniqHack:1}, {unique:true},function(err,res){});
  db.createIndex('emails',{tag:1},{unique:false},function(err,res){});
  db.createIndex('emails',{createdAt:1},{unique:false},function(err,res){});

  db.close();
  // db.createIndex('emails',{username:1}, {unique:false}, function(err,res){});
});

module.exports = exports = {
  get: function (req, res, next) {
      try {
      console.log('got to the right express route')
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
                  })
                }
                if (info.which === 'TEXT'){
                  stream.on('data', function(chunk){
                    bodyBuffer += chunk;
                  });
                 }
               })
               msg.once('attributes', function(attrs){
                UID = attrs.uid;
               })
               msg.on('end', function(){

                var message = {body: bodyBuffer.toString('utf8'), headers: headerBuffer, uid: UID};
                //add individual email to database with appropriate tags if it is not currently in db
                mongoClient.connect("mongodb://localhost:27017/mailcrunch2", function(err, db) {
                  if(err) { throw (err); }
                  var collection = db.collection('emails');
                  message.tag = 'unsorted';
                  message.username = 'bizarroForrest';
                  message.createdAt = message.headers['date'][0];
                  //this line creates a unique id for the email based on the user's username and the message-id which should be unique
                  //for future versions might need to refactor as message-id might not be unique.
                  message.headersUniqHack = message.username + message.headers['message-id'][0].split('@')[0].slice(1);
                  collection.insert(message, {w:1}, function(err,results){
                    if (err){
                      console.log(err);
                    }
                  });
                });
               });
            });
            fetched.once('end', function(){
              //connect to database and pull out all the emails
              //eventually need to pipe in username from client.
              mongoClient.connect("mongodb://localhost:27017/mailcrunch2", function(err, db) {
                if(err) { throw err; }
                var collection = db.collection('emails');
                collection.find({username:'bizarroForrest', tag:'unsorted'}).toArray(function(err, emails){
                  if (err) {
                    console.log(err);
                    throw (err);
                  }
                  res.end(JSON.stringify(emails));
                });
              });
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
    }
    catch (e){
      console.log(e);
    }
  },

  post: function (req, res, next) {
    var note = req.body.note;
    var $promise = Q.nbind(Note.create, Note);
    $promise(note)
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      });
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