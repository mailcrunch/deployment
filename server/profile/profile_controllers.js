"use strict";

var mongoClient = require('mongodb').MongoClient,
    ObjectId    = require('mongodb').ObjectID, //require this to use mongodb's ObjectID function for retrieval of BSON encoded ids
    auth        = require('../main/auth.js'); // For importing the clientId and secret for getting emails

module.exports = exports = {
  getProfile: function(req,res,next){
    if (!req.session.user){
      res.redirect('/#/login');
    }
    var username = req.session.user;
    try {
      mongoClient.connect(auth.dbAuth.dbUri, function(err, db) {
        if (err) throw err;
        var collection = db.collection('users');
        collection.find({username:username}).toArray(function(err,profileData){
          if (err) throw err;
          res.end(JSON.stringify(profileData));
        });
      });
    }
    catch (e){
      console.log(e);
    }
  }
};