"use strict";

var Note        = require('./note_model.js'),
    Q           = require('q'),
    Imap        = require('imap'),
    inspect     = require('util').inspect,
    Parser      = require('imap-parser'),
    parser      = new Parser(),
    mongoClient = require('mongodb').MongoClient,
    ObjectId = require('mongodb').ObjectID;


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
              allTheEmails.push(message);
              mongoClient.connect("mongodb://localhost:27017/mailcrunch2", function(err, db) {
                if(err) { throw (err); }
                var collection = db.collection('emails');
                message.tag = 'unsorted';
                message.username = 'bizarroForrest';
                message.createdAt = message.headers['date'][0];
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
            console.log(allTheEmails);

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
            // res.end(JSON.stringify(allTheEmails));
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
      mongoClient.connect("mongodb://localhost:27017/mailcrunch2", function(err, db) {
        if(err) { throw err; }
        var collection = db.collection('emails');   
        collection.update({_id:new ObjectId(id)}, {$set: {tag:tag}}, function(err, res){
          if (err){
            throw err;
          }
          console.log(res);
          console.log('id ' + id + '###' + tag);
        });
      });
    });
    res.end();
  },
};