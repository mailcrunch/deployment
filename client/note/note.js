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
.controller('NoteController', function($scope, $rootScope, InboxFactory, Inbox) {

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
              $scope.email.to = response.data[i].headers.to.toString();
              $scope.email.from = response.data[i].headers.from.toString();
              $scope.email.subject = response.data[i].headers.subject.toString();
              $scope.email.time = response.data[i].headers.date.toString();
              $scope.email.body = response.data[i].body;
              $scope.inbox.push($scope.email); 
              Inbox.sortedInbox.push($scope.email);
            }
          }
        });
    };
    $scope.sortManage = function(){
      $scope.inbox[0]['bucket'] = 'manage';
      $scope.inbox[0]['status'] = 'sorted';
      $scope.inbox.shift();
      $rootScope.timeLeft = 6;
    };
    $scope.sortFocus = function(){
      $scope.inbox[0]['bucket'] = 'focus';
      $scope.inbox[0]['status'] = 'sorted';
      $scope.inbox.shift();
      $rootScope.timeLeft = 6;
    };
    $scope.sortAvoid = function(){
      $scope.inbox[0]['bucket'] = 'avoid';
      $scope.inbox[0]['status'] = 'sorted';
      $scope.inbox.shift();
      $rootScope.timeLeft = 6;
    };
    $scope.sortLimit = function(){
      $scope.inbox[0]['bucket'] = 'limit';
      $scope.inbox[0]['status'] = 'sorted';
      $scope.inbox.shift();
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
