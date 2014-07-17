angular.module('myApp.main.note', ['ui.router'])

.config(function ($stateProvider) {

  $stateProvider
    .state('myApp.main.note', {
      url: '/sort',
      templateUrl: 'note/note.tpl.html',
      controller: 'NoteController'
    });
})

.controller('NoteController', function($scope, $interval, InboxFactory, Inbox, PointFactory, UpdateEmailTag) {

    $scope.inbox = [];
    $scope.timer = 10;

    var result;
    $scope.getEmails = function(){
      // This function works the same as in client/crunch/crunch.js
      $scope.clicked = true;
      InboxFactory.getEm()
        .then(function(response){
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
              if ($scope.email.body === undefined){
                $scope.email.body = 'no message contents';
              } else {
                $scope.email.body = response.data[i].body;
              }
              $scope.email.to = response.data[i].headers.to.toString();
              $scope.email.from = response.data[i].headers.from.toString();
              $scope.email.time = response.data[i].headers.date.toString();
              $scope.email.id = response.data[i].uid.toString();
              $scope.email._id = response.data[i]._id;
              $scope.inbox.push($scope.email); 
            }
            $scope.clicked = false;
          }
          $scope.timerStart();
        });
    };

    // This function resets the timer after the user sorts the email
    $scope.timerReset = function(){
      $interval.cancel(result);
      $scope.timerStart();
    };

    // This function updates the points for the user
    $scope.updatePoints = function(){
      if ($scope.timer !== 0 && $scope.timer !== '0'){
        PointFactory.incrementPoints(100);
      }
      if ($scope.inbox.length === 0){
        PointFactory.incrementPoints(100); 
      }
    };
/*
=======================================================================
=======================================================================
  These are the sorting functions for each email
  At a high level, when an image is clicked on,
  the email's 'bucket' property is updated to the
  corresponding category
  v         v          v          v          v          
=======================================================================
=======================================================================
*/

    $scope.sortManage = function(){
      // This updates the email's 'bucket' property
      $scope.inbox[0]['bucket'] = 1;
      // This updates the email's 'status' property
      $scope.inbox[0]['status'] = 'sorted';
      var id = $scope.inbox[0]['_id'];
      var tag = 'sorted';
      var bucket = 1;
      UpdateEmailTag.update(id + '###' + tag + '###' + bucket);
      $scope.inbox.shift();
      $scope.updatePoints();
      $scope.timerReset();
    };
    $scope.sortFocus = function(){
      $scope.inbox[0]['bucket'] = 2;
      $scope.inbox[0]['status'] = 'sorted';
      var id = $scope.inbox[0]['_id'];
      var tag = 'sorted';
      var bucket = 2
      UpdateEmailTag.update(id + '###' + tag + '###' + bucket);
      $scope.inbox.shift();
      $scope.updatePoints();
      $scope.timerReset();
    };
    $scope.sortAvoid = function(){
      $scope.inbox[0]['bucket'] = 3;
      $scope.inbox[0]['status'] = 'sorted';
      var id = $scope.inbox[0]['_id'];
      var tag = 'sorted';
      var bucket = 3;     
      UpdateEmailTag.update(id + '###' + tag + '###' + bucket);
      $scope.inbox.shift();
      $scope.updatePoints();
      $scope.timerReset();
    };
    $scope.sortLimit = function(){
      $scope.inbox[0]['bucket'] = 4;
      $scope.inbox[0]['status'] = 'sorted';
      var id = $scope.inbox[0]['_id'];
      var tag = 'soted';
      var bucket = 4;
      UpdateEmailTag.update(id + '###' + tag + '###' + bucket);
      $scope.inbox.shift();
      $scope.updatePoints();
      $scope.timerReset();
    };

/*
=======================================================================
=======================================================================
  ^          ^          ^          ^           ^           
  These are the sorting functions for each email 
=======================================================================
=======================================================================
*/
    // And here is the timer
    $scope.timerStart = function(){
      if ($scope.timer !== 10){
        $scope.timer = 10;
      }
      result = $interval(function(){
        if ($scope.timer === 0){
          $scope.timer = '0';
        } else if ($scope.timer === '0'){
          $scope.timer = 0;
        } else {
          $scope.timer--;
        }
      },1000);
    };

});
