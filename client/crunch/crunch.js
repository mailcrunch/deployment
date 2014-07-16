angular.module('myApp.main.crunch', ['ui.router'])

.config(function($stateProvider) {

  $stateProvider
    .state('myApp.main.crunch', {
      url: '/crunch',
      templateUrl: 'crunch/crunch.tpl.html',
      controller: 'CrunchController'
    });
})

.controller('CrunchController', function($scope, $interval, Inbox, SendMessageFactory) {
  $scope.inbox = Inbox.sortedInbox.sort(function(a,b){return a.bucket - b.bucket});
  var timerId;
  $scope.timer = 0;
  
  var manageTimer = function(){
    console.log(' i am here')
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
    console.log(timerId)
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
    console.log(timerId)
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
    console.log(timerId)
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
    console.log(timerId)
  };
  
  var bucketChecker = function(){
    if($scope.inbox[0].bucket === 1){
        manageTimer();
    }else if($scope.inbox[0].bucket === 2){
        focusTimer();
    }else if ($scope.inbox[0].bucket === 3){
        avoidTimer();
    }else if ($scope.inbox[0].bucket === 4){
        limitTimer();
    }
  }

  $scope.send = function(){
    var message = '###' + $('#to').val() + '###' + $('#subject').val() + '###' + $('#message').val();
    SendMessageFactory.sendMessage(message)
      .then(function(response){
        // console.log(response);
      });
    Inbox.shiftQ();
    $interval.cancel(timerId);
    bucketChecker();
    $('#subject').val('');
    $('#message').val('');
  };

  $scope.next = function(){
    Inbox.shiftQ();
    $interval.cancel(timerId);
    bucketChecker();
  };

  $scope.markAsRead = function(){
    var messageID = $scope.inbox[0].id;
    SendMessageFactory.markingAsRead(messageID);
  };

  // var timerReset = function(timerId){
  //   console.log('got into timerReset f(n)', timerId)
  //   $interval.cancel(timerId);
  // };


  bucketChecker();

})

.controller('mantra',function($scope, Inbox){
  $scope.inbox = Inbox.sortedInbox.sort(function(a,b){return a.bucket - b.bucket});
  $scope.message = "What's done is done."
  if($scope.inbox[0]['bucket'] === 1){
    $scope.message = "Take time to handle this yourself. It's important and pressing."
  }else if($scope.inbox[0]['bucket'] === 2){
    $scope.message = "Schedule time to come back to this. It's an investment in the future."  
  }else if($scope.inbox[0]['bucket'] === 3){
    $scope.message = "How can you delegate this task?"
  }else if($scope.inbox[0]['bucket'] === 4){
    $scope.message = "Read this only for your entertainment, and spend the minimum amount of time on it possible."
  }
})