(function(angular){
  "use strict";
  angular.module('myApp')


  //=============================================================================
  // This is where we get and store the profile information for a specific user
  //=============================================================================
  .factory('ProfileFactory',function($http){
    var fullName = "Not Logged In";
    var userEmail = "";

    var getProfile = function(){
      return $http({
        method: 'POST',
        url: '/main/profile/data',
      })
      .then(function(response){
        fullName = response.data[0].displayName;
        userEmail = response.data[0].username;
        console.log("resp received & new values set");
        console.log(fullName);
        console.log(userEmail);
        return response;
      });      
    };

    return {
      fullName: fullName,
      userEmail: userEmail,
      getProfile: getProfile
    }
  })


//=============================================================================
// This factory controlls the use of the spinner on our loading page
//=============================================================================
  .factory('SpinnerFactory', function(){
    var spinner = true;
    var spinnerFunc = function(){
      return !spinner;
    };
    return {
      spinnerFunc: spinnerFunc
    }
  })

  //=============================================================================
  // This factory keeps track of the points a user has
  //=============================================================================
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
    };

    var inbox = [];

    return {
      getSortedInbox: getSortedInbox,
      inbox: inbox
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
          // On getting a succesful response, the email body needs to be 
          // formatted. Take a look at the raw response to see why...
          for (var i = 0; i < response.data.length; i++){
            if (response.data[i].headers['x-mailer'] === undefined){
              if (response.data[i].headers['x-failed-recipients']){
                response.data[i].body = 'Message delivery failed';
              } else {
                // console.log(response.data[i].body);
                // response.data[i].body = response.data[i].body.split('UTF-8')[1];
                // response.data[i].body = response.data[i].body.split('--')[0]; 
                //make body pretty later.... might use these two strings but make it work better...
                response.data[i].body = response.data[i].body;

              }
            }
          }
          // After formatting, return response to client/note/note.js
          return response;
          
        });
      };
      return {
        getEm: getEm
      };
    })
  // TODO: Liev will comment this out...
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

  // This factory is used to send messages and mark them as read 
  // from client/crunch/crunch.js
  .factory('SendMessageFactory', function($http){
    // This function sends the messages via SMTP/Nodemailer
    // See server/crunch/crunch_routes.js and server/crunch/crunch_controllers.js
  	var sendMessage = function(message){
  		return $http({
  			method: 'POST',
  			url: '/main/crunch',
  			data: message,
  		})
  		.then(function(response){
  			console.log(response);
  		});
  	};

    // This function marks the email that was sent as read, so we don't
    // retrieve it again when we call InboxFactory.getEm()
    // See server/crunch/crunch_routes.js and server/crunch/crunch_controllers.js
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

