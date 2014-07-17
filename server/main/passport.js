// passport.js

var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , authCredentials = require('./auth.js'),
  xoauth2 = require('xoauth2');

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
    var xoauth2gen = xoauth2.createXOAuth2Generator({
      user: "bizarroforrest",
      clientId: authCredentials.googleAuth.clientID,
      clientSecret: authCredentials.googleAuth.clientSecret,
      refreshToken: '1/m1y5tHN2WDV6uJ4uMM1MMZQws9DY2YLie9oxjQHMsNM',
      accessToken: accessToken
    });
    xoauth2gen.getToken(function(err, token){
    if(err){
        return console.log(err);
    }
      console.log("AUTH XOAUTH2 " + token);
    });
    return done(profile);
  }
));