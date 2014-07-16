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
  // var routes = require('./routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
  app.set('port', process.env.PORT || 3000);
  app.set('base url', process.env.URL || 'http://localhost');
  
  // set up our express application
  app.use(morgan('dev')); // log every request to the console
  // app.use(cookieParser()); // read cookies (needed for auth)
  app.use(bodyParser.json()); // get information from html forms
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(middle.cors);

  // var AuthRouter = express.Router();
  // app.use('/', routers.AuthRouter);
  // app.use(express.static(__dirname + '/../../auth-client/')); //this line sends the login page
  app.use(express.static(__dirname + '/../../client/')); //this line sends the entire application (only if the user has an auth cookie)

  
  //routers for http requests back and forth from the client to the server for email data
  // var routers = {};
  // var NoteRouter = express.Router();
  // routers.NoteRouter = NoteRouter;
  // var CrunchRouter = express.Router();
  // routers.CrunchRouter = CrunchRouter;
  // app.use('/note', routers.NoteRouter);
  // app.use('/crunch', routers.CrunchRouter);
  
  //middleware for getting and sending emails
  app.use(middle.emailSender);
  app.use(middle.emailGetter);
  app.use(middle.logError);
  app.use(middle.handleError);

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
      res.redirect('/main/home');
    });

  // GET /auth/google/return
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get('/auth/google/return', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/');
    });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });



  // required for passport
  // app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
  // app.use(passport.initialize());
  // app.use(passport.session()); // persistent login sessions
  // app.use(flash()); // use connect-flash for flash messages stored in session

};