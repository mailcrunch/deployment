(function(angular){
  "use strict";
  angular.module('myApp')

  .factory('Inbox', function(){
    
	return {Inbox: Inbox};
  })

  .factory('sortTimer', function(){
	return {reset: function(){
		return timeLeft = 5;
	}};
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
  		return $http({
  			method: 'GET',
  			url: '/main/login'
  		})
  		.then(function(response){
  			console.log((response));
  			
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

