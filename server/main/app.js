"use strict";

// This file sets up express for the other files
var express = require('express');
var app = express();

require('./config.js')(app, express);

module.exports = exports = app;