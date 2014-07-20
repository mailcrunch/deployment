"use strict";

var controller = require('./profile_controllers.js');
    

module.exports = exports = function (app) {
  app.post('/', controller.post);
  app.post('/profile',controller.getProfile);
};