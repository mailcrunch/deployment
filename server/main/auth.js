///DO NOT COMMIT SECURE DATA HERE!

module.exports = {
  'googleAuth' : {
    'clientID'    : 'googleClientAPI key goes here',
    'clientSecret'  : 'google Client Secret goes here',
  	'callbackURL' 	: '/auth/google/callback', //this might need to change for azure deployment
  },
  'dbAuth' : {
    'dbUri' : 'mongodb://localhost:27017/mailcrunch2' //this needs to change to mongolab db for deployment
  },
  'sessionSecret':'Put-Session-Secret-Here' //changeme when deploying live
};

