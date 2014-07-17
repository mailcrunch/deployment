"use strict";

// This file sets up express for the other files
var express = require('express');
var app = express(),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

require('./config.js')(app, express, passport, GoogleStrategy);

module.exports = exports = app;