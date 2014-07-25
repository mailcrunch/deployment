angular.module('myApp.main.crunch', ['ui.router', 'ngSanitize','textAngular'])

.config(function($stateProvider) {

  $stateProvider
    .state('myApp.main.crunch', {
      url: '/crunch',
      templateUrl: 'crunch/crunch.tpl.html',
      controller: 'CrunchController'
    });
})

.controller('CrunchController', function($scope, $interval, Inbox, SendMessageFactory, PointFactory, UpdateEmailTag, LoginFactory) {
  LoginFactory.loginCheck()
  .then(function(response){
    if (response === 'false'){
      $state.transitionTo('myApp.public.login')
    } else {

    $scope.inbox = [];
    // This function is in common/factories.js
    Inbox.getSortedInbox()
      .then(function(response){
        console.log("email received from getsortedinbox in crunch", response.data);
        // The promise returned is the email data
 
        for (var i = 0; i < response.data.length; i++){
          if (response.data[i].headers.from !== undefined){
            $scope.email = {
              status: 'pending',
              bucket: null
            };
            if (response.data[i].headers.subject === undefined){
              $scope.email.subject = 'no subject';
            } else {
              $scope.email.subject = response.data[i].headers.subject.toString();
            }
            if (response.data[i].body === undefined){
              $scope.email.body = 'no message contents';
            } else {
              if (response.data[i].body.indexOf('<b>') > -1){
                response.data[i].body = response.data[i].body.slice(response.data[i].body.indexOf('<b>') + 3, response.data[i].body.lastIndexOf('</b>'));
              }
              $scope.email.body = response.data[i].body;
            }
            $scope.email.to = response.data[i].headers.to.toString();
            $scope.email.from = response.data[i].headers.from.toString();
            $scope.email.time = response.data[i].headers.date.toString();
            $scope.email.id = response.data[i].uid.toString();
            $scope.email._id = response.data[i]._id;
            $scope.email.bucket = response.data[i].bucket;
            $scope.inbox.push($scope.email); 
          }
        }

        var timerId; // This will be the timerId associated with the current email
        $scope.timer = 0; // The timer starts at 0 so that it is not undefined and 
        // throw an error on page load. It will be changed below.

        // This function calls the point incrementer based on whether the user
        // has crunched the email in the alotted time
        var updatePoints = function(){
          if ($scope.timer !== 0 && $scope.timer !== '0'){
            PointFactory.incrementPoints(100);
          }
        };
      
  /*
  =======================================================================
  =======================================================================
    These are the timer functions for each email sorting category
    v         v          v          v          v          v      
  =======================================================================
  =======================================================================
  */
        var manageTimer = function(){
          if ($scope.timer !== 300){
            $scope.timer = 300;
          }
          timerId = $interval(function(){
            if ($scope.timer === 0){
              $scope.timer = '0';
            } else if ($scope.timer === '0'){
              $scope.timer = 0;
            } else {
              $scope.timer--;
            }
          },1000);
        };


        var focusTimer = function(){
          if ($scope.timer !== 240){
            $scope.timer = 240;
          }
          timerId = $interval(function(){
            if ($scope.timer === 0){
              $scope.timer = '0';
            } else if ($scope.timer === '0'){
              $scope.timer = 0;
            } else {
              $scope.timer--;
            }
          },1000);
        };

        var avoidTimer = function(){
          if ($scope.timer !== 120){
            $scope.timer = 120;
          }
          timerId = $interval(function(){
            if ($scope.timer === 0){
              $scope.timer = '0';
            } else if ($scope.timer === '0'){
              $scope.timer = 0;
            } else {
              $scope.timer--;
            }
          },1000);
        };

        var limitTimer = function(){
          if ($scope.timer !== 60){
            $scope.timer = 60;
          }
          timerId = $interval(function(){
            if ($scope.timer === 0){
              $scope.timer = '0';
            } else if ($scope.timer === '0'){
              $scope.timer = 0;
            } else {
              $scope.timer--;
            }
          },1000);
        };
  /*
  =======================================================================
  =======================================================================
    ^          ^          ^          ^           ^           ^
    These are the timer functions for each email sorting category
  =======================================================================
  =======================================================================
  */
        // This function checks what 'bucket' or category the email has been
        // sorted into and calls the corresponding timer function
        var bucketChecker = function(){
          if ($scope.inbox[0]) {
            if ($scope.inbox[0].bucket === '1') {
                manageTimer();
            } else if ($scope.inbox[0].bucket === '2') {
                focusTimer();
            } else if ($scope.inbox[0].bucket === '3') {
                avoidTimer();
            } else if ($scope.inbox[0].bucket === '4') {
                limitTimer();
            }
          }
        };

        // The function is called when the send button is clicked
        // See client/crunch/crunch.tpl.html
        $scope.send = function(){
          // This is the message data that will be sent to our server
          // It is constructed this way so that the server can parse it and
          // put the right values in the right places
          // See server/crunch/crunch_controllers.js --the 'post' function
          var message = $('#to').val() + '###' + $('#subject').val() + '###' + $scope.message;/*$('#message').val()*/
          // See client/common/factories.js
          SendMessageFactory.sendMessage(message);
          // These are variables needed for the UpdateEmailTag function
          var id = $scope.inbox[0]._id;
          var tag = 'replied';
          var bucket = $scope.inbox[0].bucket;
          // See client/common/factories.js
          UpdateEmailTag.update(id + '###' + tag + '###' + bucket);
          // This removes the first email from the queue
          $scope.inbox.shift();
          // This cancels the timer for this particular email
          $interval.cancel(timerId);
          updatePoints();
          bucketChecker();

          // This sets out message reply to be blank
          // $('#message').val('');
          $scope.message = '';

          if ($scope.inbox.length > 0) {
            // If there are emails in the queue, this updates the subject
            $('#subject').val('RE: '+ $scope.inbox[0].subject);
          } else {
            // Otherwise, this is the subject
            $('#subject').val('');
          }

        };
        
        // This function is called when the 'next' button is clicked
        // See client/crunch/crunch.tpl.html
        $scope.next = function(){
          $scope.inbox.shift();
          $interval.cancel(timerId);
          updatePoints();
          bucketChecker();
        };

        // This function marks emails as read. See client/common/factories.js
        $scope.markAsRead = function(){
          var messageID = $scope.inbox[0].id;
          SendMessageFactory.markingAsRead(messageID);
        };
      
        bucketChecker();
      });
    }
  })
})

.controller('mantra',function($scope, Inbox){
  // This function gets the emails and builds the inbox for this controller
  Inbox.getSortedInbox()
    .then(function(response){
      $scope.inbox = response.data;
      $scope.message = "What's done is done."
      if ($scope.inbox[0]) {
        if ($scope.inbox[0]['bucket'] === '1') {
          $scope.message = "Take time to handle this yourself. It's important and pressing."
        } else if ($scope.inbox[0]['bucket'] === '2') {
          $scope.message = "Schedule time to come back to this. It's an investment in the future."  
        } else if ($scope.inbox[0]['bucket'] === '3') {
          $scope.message = "How can you delegate this task?"
        } else if ($scope.inbox[0]['bucket'] === '4') {
          $scope.message = "Read this only for your entertainment, and spend the minimum amount of time on it possible."
        }
      }
    });
})