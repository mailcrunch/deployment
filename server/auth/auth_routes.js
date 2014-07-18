"use strict";

var controller = require('./auth_controllers.js');

module.exports = exports = function (router) {
  router.route('/public/login')
    .get(controller.get)
    .post(controller.post);
};