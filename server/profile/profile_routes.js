"use strict";

var controller = require('./profile_controllers.js');
    

module.exports = exports = function (app) {
  app.post('/main/home',controller.getProfileData);
};