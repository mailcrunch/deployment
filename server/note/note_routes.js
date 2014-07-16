"use strict";

var controller = require('./note_controllers.js');
    

module.exports = exports = function (app) {
  app.post('/updateEmailTag',controller.updateEmailTag);
  app.get('/', controller.get);
};