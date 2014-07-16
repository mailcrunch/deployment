angular.module('myApp.main.note', ['ui.router'])

.config(function ($stateProvider) {

  $stateProvider
    .state('myApp.main.note', {
      url: '/sort',
      templateUrl: 'note/note.tpl.html',
      controller: 'NoteController'
    });
})

//this is dummy data to test the list of inbox emails	
.controller('NoteController', function($scope, $interval, InboxFactory, Inbox, PointFactory) {

    $scope.inbox = [];
    $scope.timer = 10;

    var result;
    $scope.getEmails = function(){
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
              $scope.inbox.push($scope.email); 
            }
          }
          $scope.timerStart();
        });
    };
    $scope.timerReset = function(){
      $interval.cancel(result);
      $scope.timerStart();
    };
    $scope.updatePoints = function(){
      if ($scope.timer !== 0){
        PointFactory.incrementPoints(100);
      }
    }
    $scope.sortManage = function(){
      $scope.inbox[0]['bucket'] = 1;
      $scope.inbox[0]['status'] = 'sorted';
      Inbox.sortedInbox.push($scope.inbox.shift());
      $scope.updatePoints();
      $scope.timerReset();
    };
    $scope.sortFocus = function(){
      $scope.inbox[0]['bucket'] = 2;
      $scope.inbox[0]['status'] = 'sorted';
      Inbox.sortedInbox.push($scope.inbox.shift());
      $scope.updatePoints();
      $scope.timerReset();
    };
    $scope.sortAvoid = function(){
      $scope.inbox[0]['bucket'] = 3;
      $scope.inbox[0]['status'] = 'sorted';
      Inbox.sortedInbox.push($scope.inbox.shift());
      $scope.updatePoints();
      $scope.timerReset();
    };
    $scope.sortLimit = function(){
      $scope.inbox[0]['bucket'] = 4;
      $scope.inbox[0]['status'] = 'sorted';
      Inbox.sortedInbox.push($scope.inbox.shift());
      $scope.updatePoints();
      $scope.timerReset();
      
    };
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
      console.log(result);
    };

});
