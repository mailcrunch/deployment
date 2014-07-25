(function(angular){
  "use strict";
  angular.module('myApp')

// didn't end up needing this filter for ngSanitize
//   .filter('safe', function($sce) {
//     return function(htmlString) {
//         return $sce.trustAsHtml(htmlString);
//     };
// })


  // This factory makes a get request to the server and checks if the user is logged in
  // The response is used in all controllers to check if the user is logged in and transition states if they are not
  .factory('LoginFactory', function($http){
    var loginCheck = function(){
      return $http({
        method: 'GET',
        url: 'main/sort/session'
      })
      .then(function(response){
        return response.data;
      })
    }
    return {
      loginCheck: loginCheck
    }
  })

  //=============================================================================
  // This is where we get and store the profile information for a specific user
  //=============================================================================
  .factory('ProfileFactory',function($http){

    var getProfile = function(){
      return $http({
        method: 'POST',
        url: '/main/profile/data',
      })
      .then(function(response){
        var profile = {};
        profile.fullName = response.data[0].displayName;
        profile.userEmail = response.data[0].username;
        profile.profilePhoto = response.data[0].profile.picture;
        return profile;
      })     
    };

    return {
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

    // clear inbox
    var clear = function() {
      this.inbox = [];
    };

    return {
      inbox: inbox,
      clear: clear,
      getSortedInbox: getSortedInbox,
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
          // for (var i = 0; i < response.data.length; i++){
          //   console.log('buzzlgihtyaer ',response.data[i]);
          //   if (response.data === 'no messages today'){
          //     return response;
          //   }
          //   if (response.data[i].headers['x-mailer'] === undefined){
          //     if (response.data[i].headers['x-failed-recipients']){
          //       response.data[i].body = 'Message delivery failed';
          //     } else if (response.data[i].body.indexOf('This is an automatically generated Delivery Status') > -1) {
          //       response.data[i].body = response.data[i].body;
          //     } else if (response.data[i].body.indexOf('UTF-8') > -1){
          //        // if (response.data[i].body.indexOf('Content-Type: multipart/alternative') > -1) {
          //       //   response.data[i].body = response.data[i].body.split('Content-Transfer-Encoding: quoted-printable')[1];
          //       //     response.data[i].body = response.data[i].body.split('--')[0]; 
          //       //  }
          //       //  else if (response.data[i].body.indexOf('Content-Transfer-Encoding: quoted-printable') > -1) {
          //       //   response.data[i].body = response.data[i].body.split('Content-Transfer-Encoding: quoted-printable')[1];
          //       //   response.data[i].body = response.data[i].body.split('--')[0]; 
          //       // } else {
          //       //right now it's only grabbing plain text, which is why it isn't displaying properly.
          //       // gonna grab the HTML, too, and display that first and if not available, then plain text
          //       // response.data[i].body = response.data[i].body.split('UTF-8')[1];
          //       // response.data[i].body = response.data[i].body.split('--')[0]; 
          //         response.data[i].body = response.data[i].body.split('UTF-8')[1];
          //         response.data[i].body = response.data[i].body.split('--')[0]; 
          //     } else {
          //       response.data[i].body = response.data[i].body;
          //     //   var formattedBody = $parseEmail(response.data[i].body);
          //     //   console.log('formatted email data:', formattedBody);
          //     //   response.data[i].body = formattedBody;
          //     }
          //   }
          // }
          console.log("requestion!");

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

