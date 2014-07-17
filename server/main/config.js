"use strict";


var mongoose    = require('mongoose'),
    morgan      = require('morgan'),
    bodyParser  = require('body-parser'),
    middle      = require('./middleware'),
    passport    = require('passport');
/*
 * Include all your global env variables here.
*/
// And here is where we configure our routes and assets
module.exports = exports = function (app, express) {
  var noteRouter = express.Router();
  var crunchRouter = express.Router();
  app.set('port', process.env.PORT || 3000);
  app.set('base url', process.env.URL || 'http://localhost');
  app.use(morgan('dev'));
  app.use(middle.cors);
  app.use(express.static(__dirname + '/../../client'));
  app.use('/main/sort', noteRouter);
  app.use('/main/crunch', crunchRouter);
  app.use(middle.logError);
  app.use(middle.handleError);
  require('../note/note_routes.js')(noteRouter);
  require('../crunch/crunch_routes.js')(crunchRouter);
};

