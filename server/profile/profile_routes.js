"use strict";

var controller = require('./profile_controllers.js');
    

module.exports = exports = function (app) {
  app.post('/data', controller.getProfile);
  app.post('/main/profile/data', controller.getProfile);
};