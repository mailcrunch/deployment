"use strict";

var controller = require('./note_controllers.js');
    

module.exports = exports = function (app) {
  app.post('/updateEmailTag',controller.updateEmailTag);
  app.post('/getSortedInbox', controller.getSortedInbox);
  app.get('/', controller.get);
};