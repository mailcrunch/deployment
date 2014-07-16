"use strict";

var express = require('express');
var app = express(),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').Strategy;

require('./config.js')(app, express, passport, GoogleStrategy);

// // required for passport
// app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
// app.use(passport.initialize());
// app.use(passport.session()); // persistent login sessions
// app.use(flash()); // use connect-flash for flash messages stored in session

// require('../note/note_routes.js')(NoteRouter);

// require('../crunch/crunch_routes.js')(CrunchRouter);

module.exports = exports = app;