"use strict";

var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  content: String,

  title: {
    type: String,
    required: true
  }
});

module.exports = exports = mongoose.model('user', UserSchema);