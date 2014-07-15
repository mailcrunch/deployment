"use strict";

var controller = require('./note_controllers.js');
    

module.exports = exports = function (app) {
  app.get('/', controller.get);
};