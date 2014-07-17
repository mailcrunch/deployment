"use strict";

/*
 * MiddleWare for the entire app
*/
// Here we have our error logging and handling and our cors headers
var fs = require('fs');

module.exports = exports = {

  logError: function (err, req, res, next) {
    if (err) {
      console.error(err);
      return next(err);
    }
    next();
  },

  handleError: function (err, req, res, next) {
    if (err) {
      res.send(500, err);
    }
    next();
  },
  cors: function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Header', 'Content-type, Authorization');

    if (req.method === 'Options') {
      res.send(200);
    } else {
      return next();
    }
  }
};