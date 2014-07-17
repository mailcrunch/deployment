
var mongoClient = require('mongodb').MongoClient;

mongoClient.connect('mongodb://localhost:27017/mailcrunch2', function(err,db){
  db.createCollection('users',function(err,collection){});
  db.createIndex('users', {username: 1}, {unique: true}, function(err,res){});
  db.close();
});

module.exports = exports = {
  store: function(profile,accessToken,refreshToken){
    mongoClient.connect("mongodb://localhost:27017/mailcrunch2", function(err, db) {
      if(err) { throw err; }
      var users = db.collection('users');
      users.update(
        {username:profile.email},
        {username:profile.email, profile:profile,accessToken:accessToken,refreshToken:refreshToken},
        {upsert:true},
        function(err,res){
          if (err) throw err;
          console.log(res);
        }
      );
    });
  }
}