"use strict";


var mongoose    = require('mongoose'),
    morgan      = require('morgan'),
    cookieParser  = require('cookie-parser'),
    bodyParser  = require('body-parser'),
    session = require('express-session'),
    middle      = require('./middleware');

// mongoose.connect(process.env.DB_URL || 'mongodb://localhost/myApp');

/*
 * Include all your global env variables here.
*/
module.exports = exports = function (app, express, passport, GoogleStrategy) {
  var noteRouter = express.Router();
  var crunchRouter = express.Router();
  var profileRouter = express.Router();
  app.set('port', process.env.PORT || 3000);
  app.set('base url', process.env.URL || 'http://localhost');
  // set up our express application
  app.use(morgan('dev')); // log every request to the console
  app.use(middle.cors);

  app.use(express.static(__dirname + '/../../client/')); //this line sends the entire application (only if the user has an auth cookie)

  app.use(session({
    // genid: function(req) {
    //   return genuuid(); // use UUIDs for session IDs
    // },
    secret: 'bloodhound666',
    // cookie: { secure: true },
    saveUninitialized: true,
    resave: true
  }))
  //sessions are established with cookies
  app.use(passport.initialize());

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/public/login');
  });
  
  //call passport oauth google strategy
  var strategy = require('./passport.js');

  // GET /auth/google
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Google authentication will involve redirecting
  //   the user to google.com.  After authenticating, Google will redirect the
  //   user back to this application at /auth/google/return
  app.get('/auth/google', 
    passport.authenticate('google', {
      scope: ['https://www.googleapis.com/auth/userinfo.profile',
              'https://mail.google.com',
              'https://www.googleapis.com/auth/userinfo.email',
              'https://www.googleapis.com/auth/plus.profile.emails.read',
              'https://www.googleapis.com/auth/plus.login'],
      accessType: 'offline', approvalPrompt: 'force' ,
      failureRedirect: '/public/login' 
    }),
    function(req, res) {
      res.redirect('/auth/google/data');
    });

  // GET /auth/google/return
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get('/auth/google/callback', 
    passport.authenticate('google', { 
 failureRedirect: '/#/public/login' }),
    function(req, res) {
      console.log('<=====================START===============>');
      console.dir(req.user._json.email);
      console.log('<==================END==================>');
      
      req.session.regenerate(function(err){
        if(err) throw err;
        req.session.user = req.user._json.email;
        res.redirect('/#/main/home');
      });
    });


  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/public/login');
  });

  app.use('/main/sort', noteRouter);
  app.use('/main/crunch', crunchRouter);
  app.use('/main/profile/data', profileRouter);
  app.use(middle.logError);
  app.use(middle.handleError);
  require('../note/note_routes.js')(noteRouter);
  require('../crunch/crunch_routes.js')(crunchRouter);
  require('../profile/profile_routes.js')(profileRouter);
};

