"use strict";

var express = require('express');
var app = express(),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').Strategy;

require('./config.js')(app, express, passport, GoogleStrategy);

module.exports = exports = app;