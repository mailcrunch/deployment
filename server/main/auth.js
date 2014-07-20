// module.exports = {
//   'googleAuth' : {
//   	'clientID' 		: '420971335353-abf8qf56ao321q75m4u561lsl5lvhjkn.apps.googleusercontent.com',
//   	'clientSecret' 	: 'Pgl6nS1xEfZZ-W4H0bMbmXAm',
//   	'callbackURL' 	: 'http://mailcrunch.azurewebsites.net/auth/google/callback',
//   },
//   'dbAuth' : {
//     'dbUri' : 'mongodb://admin:ilovemailcrunch@ds050087.mongolab.com:50087/mailcrunch'
//   }
// };


module.exports = {
  'googleAuth' : {
  	'clientID' 		: process.env.clientID,
  	'clientSecret' 	: process.env.clientSecret,
  	'callbackURL' 	: process.env.callbackURL
  },
  'dbAuth' : {
    'dbUri' : process.env.dbURI
  }
};

