"use strict";

var Crunch      = require('./crunch_model.js'),
    Q           = require('q'),
    nodemailer  = require('nodemailer');

module.exports = exports = {
  get: function (req, res, next) {
    var $promise = Q.nbind(Crunch.find, Crunch);
    $promise()
      .then(function (crunch) {
        res.json(crunch);
      })
       .fail(function (reason) {
        next(reason);
      });
  },

  post: function (req, res, next) {
    var buffer = '';
          req.on('data', function(data){
            buffer += data.toString('utf8')
          });
          req.on('end', function(){
            buffer = buffer.split('###');
            var to = buffer[1];
            var subject = buffer[2];
            var message = buffer[3];
            console.log(to);

            var smtpTransport = nodemailer.createTransport("SMTP",{
                service: "Gmail",
                auth: {
                    user: "bizarroforrest",
                    pass: "mailcrunch"
                }
            });
            var mailOptions = {
                from: "<bizarroforrest@gmail.com>", 
                to: to, 
                subject: subject, 
                text: message, 
                html: "<b>" + message + "</b>" 
            }
            smtpTransport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error);
                }else{
                    console.log("Message sent: ");
                }
            });
          });
          res.end(buffer);
        }
};