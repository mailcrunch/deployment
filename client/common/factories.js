(function(angular){
  "use strict";
  angular.module('myApp')

  // This factory keeps track of the points a user has
  .factory('PointFactory', function(){
    var pointTotal = 0;
    // This function is called any time a user sorts or crunches an email
    // in the allotted time
    var incrementPoints = function(num){
      pointTotal += num;
    };
    // This function is called in client/main/main.js
    var getPoints = function(){
      return pointTotal;
    };
    return {
      getPoints: getPoints,
      incrementPoints: incrementPoints
    }
  })

  // This factory is used to ...
  // TODO: Liev will comment this out
  .factory('Inbox', function($http){
    var sortedInbox = [];
    var getSortedInbox = function(){
      return $http({
        method: 'POST',
        url: '/main/sort/getSortedInbox',
      })
      .then(function(response){
        sortedInbox = response.data;
        return response;
      });      
    }

    return {
      getSortedInbox: getSortedInbox
    }
  })

  // This factory sends a GET request to the server to retrieve emails via IMAP
  // See server/note/note_routes.js then server/note/note_controllers.js
  .factory('InboxFactory', function($http){
      var getEm = function(){
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

