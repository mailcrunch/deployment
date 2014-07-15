"use strict";

var Crunch = require('./crunch_model.js'),
    Q    = require('q');

module.exports = exports = {
  get: function (req, res) {
     res.render('login', { user: req.user });
  },

  post: function (req, res, next) {
    // var crunch = req.body.crunch;
    // var $promise = Q.nbind(Crunch.create, Crunch);
    // $promise(crunch)
      // .then(function (id) {
      //   res.send(id);
      // })
      // .fail(function (reason) {
      //   next(reason);
      // });
  }
};