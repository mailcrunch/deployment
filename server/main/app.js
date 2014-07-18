"use strict";

var express = require('express');
var app = express(),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

require('./config.js')(app, express, passport, GoogleStrategy);
passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/plus.login'});

module.exports = exports = app;