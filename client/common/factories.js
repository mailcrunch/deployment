(function(angular){
  "use strict";
  angular.module('myApp')

  .factory('sortTimer', function(){
	return {reset: function(){
		return timeLeft = 5;
	}};
  })

  .factory('QueueView', function(){
    var sortedQueue = [];
    var getView = function(inboxObj){
      sortedQueue = inboxObj.manage.concat(inboxObj.focus);
      sortedQueue = sortedQueue.concat(inboxObj.avoid);
      sortedQueue = sortedQueue.concat(inboxObj.limit);
      return sortedQueue;
    }
    
    var shiftQ = function(){
      sortedQueue.shift();
    }

    return {
      getView: getView,
      shiftQ: shiftQ
    }
  })

  .factory('Inbox', function(){
    var sortedInbox = {
      manage: [],
      focus: [],
      avoid: [],
      limit: []
    };
    return {
      sortedInbox: sortedInbox
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
  		return $http({
  			method: 'GET',
  			url: '/main/sort'
  		})
  		.then(function(response){
        for (var i = 0; i < response.data.length; i++){
          if (response.data[i].headers['x-mailer'] === undefined){
            response.data[i].body = response.data[i].body.split('UTF-8')[1];
            response.data[i].body = response.data[i].body.split('--')[0];
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

