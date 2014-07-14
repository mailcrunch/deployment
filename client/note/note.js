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
.controller('NoteController', function($scope, $rootScope, InboxFactory) {

    $scope.inbox = [];
    $scope.getEmails = function(){
      InboxFactory.getEm()
        .then(function(response){
          console.log(response)
          for (var i = 0; i < response.data.length; i++){
            if (typeof response.data[i].headers === 'string'){
              
            }
            if (response.data[i].headers.from !== undefined){
              $scope.currentEmail = {
                status: 'pending'
              };
              $scope.currentEmail.from = response.data[i].headers.from.toString();
              $scope.currentEmail.subject = response.data[i].headers.subject.toString();
              $scope.currentEmail.time = response.data[i].headers.date.toString();
              $scope.inbox.push($scope.currentEmail); 
            }
          }
        console.log($scope.inbox)
        });
    };
    $scope.sortManage = function(){
      $scope.inbox[$scope.emailIndex]['bucket'] = 'manage';
      $scope.inbox[$scope.emailIndex]['status'] = 'sorted';
      $scope.emailIndex++;
      $scope.currentEmail = $scope.inbox[$scope.emailIndex]
      $rootScope.timeLeft = 6;
    };
    $scope.sortFocus = function(){
      $scope.inbox[$scope.emailIndex]['bucket'] = 'focus';
      $scope.inbox[$scope.emailIndex]['status'] = 'sorted';
      $scope.emailIndex++;
      $scope.currentEmail = $scope.inbox[$scope.emailIndex]
      $rootScope.timeLeft = 6;
    };
    $scope.sortAvoid = function(){
      $scope.inbox[$scope.emailIndex].bucket = 'avoid';
      $scope.inbox[$scope.emailIndex]['status'] = 'sorted';
      $scope.emailIndex++;
      $scope.currentEmail = $scope.inbox[$scope.emailIndex]
      $rootScope.timeLeft = 6;
    };
    $scope.sortLimit = function(){
      $scope.inbox[$scope.emailIndex]['bucket'] = 'avoid';
      $scope.inbox[$scope.emailIndex]['status'] = 'sorted';
      $scope.emailIndex++;
      $scope.currentEmail = $scope.inbox[$scope.emailIndex]
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
