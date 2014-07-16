"use strict";

/*
 * MiddleWare for the entire app
*/
var fs         = require('fs'),
    nodemailer = require('nodemailer'),
    Imap       = require('imap'),
    inspect    = require('util').inspect,
    Parser     = require('imap-parser'),
    parser     = new Parser();

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
    res.header('Access-Controll-Allow-Origin', '*');
    res.header('Access-Controll-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Controll-Allow-Header', 'Cotent-tyope, Authorization');

    if (req.method === 'Options') {
      res.send(200);
    } else {
      return next();
    }
    // I think the passport authentication needs to go here
  }
};