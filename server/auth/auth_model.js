"use strict";

var mongoose = require('mongoose');

var AuthSchema = new mongoose.Schema({
  content: String,

  title: {
    type: String,
    required: true
  }
});

module.exports = exports = mongoose.model('auth', AuthSchema);