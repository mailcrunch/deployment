angular.module('myApp.main.crunch', ['ui.router'])

.config(function($stateProvider) {

  $stateProvider
    .state('myApp.main.crunch', {
      url: '/crunch',
      templateUrl: 'crunch/crunch.tpl.html',
      controller: 'CrunchController'
    });
})

.controller('CrunchController', function($scope, $rootScope, Inbox, QueueView) {
  $scope.inbox = QueueView.getView(Inbox.sortedInbox);
  Inbox.timeLeft = 5;
})

.controller('ResponseController', function($scope, $rootScope, Inbox, SendMessageFactory, QueueView) {
  $scope.inbox = QueueView.getView(Inbox.sortedInbox);
  $rootScope.timeLeft = 60;

  $scope.send = function(){
    $rootScope.timeLeft = 120;
    var message = '###' + $('#to').val() + '###' + $('#subject').val() + '###' + $('#message').val();
    SendMessageFactory.sendMessage(message)
      .then(function(response){
        console.log(response);
      });
    QueueView.shiftQ();
    $('#subject').val('');
    $('#message').val('');
    return $scope.inbox;
  };

  $scope.next = function(){
    QueueView.shiftQ();
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

.controller('mantra',function($scope, $rootScope, Inbox, QueueView){
  $scope.inbox = QueueView.getView(Inbox.sortedInbox);
  console.log($scope.inbox);
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