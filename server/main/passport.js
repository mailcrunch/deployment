// passport.js

var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , GoogleStrategy = require('passport-google').Strategy
  , authCredentials = require('./auth.js');


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is serialized
//   and deserialized.

//TODO - we'll need to define the serializeUser function before invocation 
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Anthony's code:
// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//   User.findById(id, function(err, user) {
//     done(err, user);
//   });
// });


// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new GoogleStrategy({
    clientID: authCredentials.googleAuth.clientID,
    clientSecret: authCredentials.googleAuth.clientSecret,
    callbackURL: "http://127.0.0.1:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done){
    // asynchronous verification, for effect...
    // process.nextTick(function () {

      console.log("<============inside the callback: ===========>")
      console.log("accessToken: ");
      console.dir(accessToken);

      console.log("refreshToken: ");
      console.dir(refreshToken);

      console.log("profile: ");
      console.dir(profile);
      
      console.log("done property: ");
      console.dir(done);

      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    // });
  }
));
