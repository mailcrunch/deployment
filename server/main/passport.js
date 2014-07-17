// passport.js

var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , authCredentials = require('./auth.js');

// passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/plus.login'});


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new GoogleStrategy({
    clientID: authCredentials.googleAuth.clientID,
    clientSecret: authCredentials.googleAuth.clientSecret,
    callbackURL: 'http://localhost:3000/auth/google/callback',
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('acc:' + accessToken + '  refreshToken:' + refreshToken);
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
    return done(profile);
  }
));
