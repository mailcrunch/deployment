(function(angular){
  "use strict";
  angular.module('myApp')

  .factory('PointFactory', function(){
    var pointTotal = 0;
    var incrementPoints = function(num){
      pointTotal += num;
    }
    var getPoints = function(){
      return pointTotal;
    };
    return {
      getPoints: getPoints,
      incrementPoints: incrementPoints
    }
  })

  .factory('Inbox', function($http){
    var getSortedInbox = function(callback){
      return $http({
        method: 'POST',
        url: '/main/sort/getSortedInbox',
      })
      .then(function(response){
        callback(response);
      });      
    }
    var sortedInbox = [];
    var shiftQ = function(){
      sortedInbox.shift();
    };

    return {
      getSortedInbox: getSortedInbox,
      sortedInbox: sortedInbox,
      shiftQ: shiftQ
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

  .factory('UpdateEmailTag', function($http){
    var update = function(message){
      console.log(message);
      return $http({
        method: 'POST',
        url: '/main/sort/updateEmailTag',
        data: message,
      })
      .then(function(response){
        return response;
      });
    }
    return{
      update:update
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

    var markingAsRead = function(ID){
      return $http({
        method: 'POST',
        url: '/main/crunch/markEmail',
        data: ID,
      })
      .then(function(response){
        console.log('message marked as read');
      })
    }
  	return {
  		sendMessage: sendMessage,
      markingAsRead: markingAsRead
  	};
  })
}(angular));

