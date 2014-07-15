angular.module('myApp.main.crunch', ['ui.router'])

.config(function($stateProvider) {

  $stateProvider
    .state('myApp.main.crunch', {
      url: '/crunch',
      templateUrl: 'crunch/crunch.tpl.html',
      controller: 'CrunchController'
    });
})

.controller('CrunchController', function($scope, $rootScope, Inbox) {
	$scope.inbox = Inbox.sortedInbox;
  Inbox.timeLeft = 5;
})

.controller('ResponseController', function($scope, $rootScope, Inbox, SendMessageFactory) {
  $scope.inbox = Inbox.sortedInbox;
  $rootScope.emailIndex = 0;
  $scope.currentEmail = $scope.inbox[$rootScope.emailIndex];
  $rootScope.timeLeft = 60;

  $scope.send = function(){
    $rootScope.timeLeft = 120;
    $('.input-group-addon').val('');
    var message = '###' + $('#to').val() + '###' + $('#subject').val() + '###' + $('#message').val();
    console.log(message);
    SendMessageFactory.sendMessage(message)
      .then(function(response){
        console.log(response);
      });
    $scope.inbox.shift();
    $('#subject').val('');
    $('#message').val('');
  };

  $scope.next = function(){
    console.log('next function fired')
    $scope.inbox[$rootScope.emailIndex]['status'] = 'responded';
    $rootScope.emailIndex++;
    $scope.currentEmail = $scope.inbox[$rootScope.emailIndex];
    $rootScope.timeLeft = 120;
  };
})

// this controller decrements the timeLeft variable once per second
// TODO: add in a function that switches emails when timeLeft = 0;
.controller('crunchTimeLeft',function($scope,$interval, $rootScope){
  $interval(function(){
  	if($rootScope.timeLeft > 0){
  	  $rootScope.timeLeft--;
      $scope.timeLeft = $rootScope.timeLeft;
    }
  },1000);
})

.controller('mantra',function($scope, $rootScope, Inbox){
  $scope.inbox = Inbox.sortedInbox;
  $scope.message = "What's done is done."
  if($scope.inbox[0]['bucket'] === 'manage'){
    $scope.message = "Take time to handle this yourself. It's important and pressing."
  }else if($scope.inbox[0]['bucket'] === 'focus'){
    $scope.message = "Schedule time to come back to this. It's an investment in the future."  
  }else if($scope.inbox[0]['bucket'] === 'avoid'){
    $scope.message = "How can you delegate this task?"
  }else if($scope.inbox[0]['bucket'] === 'limit'){
    $scope.message = "Read this only for your entertainment, and spend the minimum amount of time on it possible."
  }
})