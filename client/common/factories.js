(function(angular){
  "use strict";
  angular.module('myApp')

  .factory('sortTimer', function(){
	return {reset: function(){
		return timeLeft = 5;
	}};
  })

  .factory('Inbox', function(){
    var sortedInbox = [];
    var shiftQ = function(){
      sortedInbox.shift();
    };

    return {
      sortedInbox: sortedInbox,
      shiftQ: shiftQ
    }
  })

  .factory('crunchTimer', function(bucket){
	    if(bucket === 'manage'){
          return timeLeft = 120;
	    }else if(bucket === 'focus'){
          return timeLeft = 240;
	    }else if (bucket === 'avoid'){
          return timeLeft = 60;
	    }else if (bucket === 'limit'){
          return timeLeft = 60;
	    }
   })

  .factory('InboxFactory', function($http){
  	var getEm = function(){
      console.log('got to the factory')
  		return $http({
  			method: 'GET',
  			url: '/main/sort'
  		})
  		.then(function(response){
        console.log(response)
        for (var i = 0; i < response.data.length; i++){
          if (response.data[i].headers['x-mailer'] === undefined){
            if (response.data[i].headers['x-failed-recipients']){
              response.data[i].body = 'Message delivery failed';
            } else {
              response.data[i].body = response.data[i].body.split('UTF-8')[1];
              response.data[i].body = response.data[i].body.split('--')[0]; 
            }
          }
        }
  			return response;
  			
  		});
  	};
  	return {
  		getEm: getEm
  	};
  })

  .factory('SendMessageFactory', function($http){
  	var sendMessage = function(message){
  		return $http({
  			method: 'POST',
  			url: '/main/crunch',
  			data: message,
  		})
  		.then(function(response){
  			return response;
  		});
  	};
  	return {
  		sendMessage: sendMessage
  	};
  })
}(angular));

