"use strict";

var mongoose    = require('mongoose'),
    morgan      = require('morgan'),
    cookieParser  = require('cookie-parser'),
    bodyParser  = require('body-parser'),
    session = require('express-session'),
    middle      = require('./middleware');

mongoose.connect(process.env.DB_URL || 'mongodb://localhost/myApp');
/*
 * Include all your global env variables here.
*/
module.exports = exports = function (app, express, passport, GoogleStrategy) {
  app.set('port', process.env.PORT || 3000);
  app.set('base url', process.env.URL || 'http://localhost');
  // set up our express application
  app.use(morgan('dev')); // log every request to the console
  app.use(middle.cors);
  app.use(express.static(__dirname + '/../../client/')); //this line sends the entire application (only if the user has an auth cookie)

  app.use(session({ secret: 'iheartpizza' })); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  // app.use(flash()); // use connect-flash for flash messages stored in session
  
  //call passport oauth google strategy
  var strategy = require('./passport.js');

  // GET /auth/google
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Google authentication will involve redirecting
  //   the user to google.com.  After authenticating, Google will redirect the
  //   user back to this application at /auth/google/return
  app.get('/auth/google', 
    passport.authenticate('google', { failureRedirect: '/public/login' }),
    function(req, res) {
      res.redirect('/auth/google/data');
    });

  // GET /auth/google/return
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get('/auth/google/return', 
    passport.authenticate('google', { failureRedirect: '/#/public/login' }),
    function(req, res) {
      res.redirect('/#/main/home');
    });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/public/login');
  });

};

