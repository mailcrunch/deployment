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
.controller('NoteController', function($scope, $rootScope, InboxFactory, Inbox, UpdateEmailTag) {

    $scope.inbox = [];
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
              $scope.email._id = response.data[i]._id;
              $scope.inbox.push($scope.email); 
            }
          }
        });
    };
    $scope.sortManage = function(){
      $scope.inbox[0]['bucket'] = 1;
      $scope.inbox[0]['status'] = 'sorted';
      var id = $scope.inbox[0]['_id'];
      var tag = 'manage';
      console.log('d' + id + '###' + tag);
      UpdateEmailTag.update(id + '###' + tag);
      Inbox.sortedInbox.push($scope.inbox.shift());
      $rootScope.timeLeft = 6;
    };
    $scope.sortFocus = function(){
      $scope.inbox[0]['bucket'] = 2;
      $scope.inbox[0]['status'] = 'sorted';
      var id = $scope.inbox[0]['_id'];
      var tag = 'focus';
      UpdateEmailTag.update(id + '###' + tag);
      Inbox.sortedInbox.push($scope.inbox.shift());
      $rootScope.timeLeft = 6;
    };
    $scope.sortAvoid = function(){
      $scope.inbox[0]['bucket'] = 3;
      $scope.inbox[0]['status'] = 'sorted';
      var id = $scope.inbox[0]['_id'];
      var tag = 'avoid';     
      UpdateEmailTag.update(id + '###' + tag);
      Inbox.sortedInbox.push($scope.inbox.shift());
      $rootScope.timeLeft = 6;
    };
    $scope.sortLimit = function(){
      $scope.inbox[0]['bucket'] = 4;
      $scope.inbox[0]['status'] = 'sorted';
      var id = $scope.inbox[0]['_id'];
      var tag = 'limit';
      UpdateEmailTag.update(id + '###' + tag);
      Inbox.sortedInbox.push($scope.inbox.shift());
      $rootScope.timeLeft = 6;
    };

})

.controller('EmailController', function($scope){
  
})

//this controller decrements the timeLeft variable once per second
//TODO: add in a function that switches emails when timeLeft = 0;
.controller('timeLeft',function($scope,$interval, Inbox, $rootScope){
  $interval(function(){
    if($rootScope.timeLeft > 0){
  	  $rootScope.timeLeft--;
      $scope.timeLeft = $rootScope.timeLeft;
    }
  },1000);
})
