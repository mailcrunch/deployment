var authCredentials = require('./auth.js')
var mongoClient = require('mongodb').MongoClient;

// mongoClient.connect('mongodb://localhost:27017/mailcrunch2', function(err,db){
//   db.createCollection('users',function(err,collection){});
//   db.createIndex('users', {username: 1}, {unique: true}, function(err,res){});
//   db.close();
// });

module.exports = exports = {
  store: function(profile,accessToken,refreshToken){
    mongoClient.connect(process.env.dbURI, function(err, db) {
      if(err) { throw err; }
      console.log('I connected!!!');
      var users = db.collection('users');
      users.update(
        {username:profile._json.email}, //profil
        {username:profile._json.email, profile:profile._json, displayName: profile.displayName, name: profile.name, emails: profile.emails,
          provider: profile.provider, accessToken:accessToken,refreshToken:refreshToken},
        {upsert:true},
        function(err,res){
          if (err) throw err;
          console.log('foo ' + res);
        }
      );
    });
  }
}