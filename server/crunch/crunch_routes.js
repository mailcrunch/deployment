"use strict";

var controller = require('./crunch_controllers.js');

module.exports = exports = function (app) {
  app.post('/', controller.post);
};