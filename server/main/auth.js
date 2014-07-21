module.exports = {
  'googleAuth' : {
  	'clientID' 		: process.env.clientID,
  	'clientSecret' 	: process.env.clientSecret,
  	'callbackURL' 	: process.env.callbackURL
  },
  'dbAuth' : {
    'dbUri' : process.env.dbURI || 'http://localhost:27017'
  }
};

