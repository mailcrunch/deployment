module.exports = {
  'googleAuth' : {
  	'clientID' 		: process.env.clientID || require('./API_KEYS_GIT_IGNORE_THIS.js').googleAuth.clientID,
  	'clientSecret' 	: process.env.clientSecret || require('./API_KEYS_GIT_IGNORE_THIS.js').googleAuth.clientSecret,
  	'callbackURL' 	: process.env.callbackURL || require('./API_KEYS_GIT_IGNORE_THIS.js').googleAuth.callbackURL
  },
  'dbAuth' : {
    'dbUri' : process.env.dbURI || require('./API_KEYS_GIT_IGNORE_THIS.js').dbAuth.dbUri
  }
};

