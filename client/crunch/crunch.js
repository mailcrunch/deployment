angular.module('myApp.main.crunch', ['ui.router'])

.config(function($stateProvider) {

  $stateProvider
    .state('myApp.main.crunch', {
      url: '/crunch',
      templateUrl: 'crunch/crunch.tpl.html',
      controller: 'CrunchController'
    });
})

.controller('CrunchController', function($scope, $interval, Inbox, SendMessageFactory, PointFactory, UpdateEmailTag) {
  Inbox.getSortedInbox()
    .then(function(response){
      $scope.inbox = [];
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
          $scope.email.bucket = response.data[i].bucket;
          $scope.inbox.push($scope.email); 
        }
      }
      console.log($scope.inbox)
      var timerId;
      $scope.timer = 0;

      var updatePoints = function(){
        if ($scope.timer !== 0 && $scope.timer !== '0'){
          PointFactory.incrementPoints(100);
        }
      };
    
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
        console.log('made it to the bucketChecker', $scope.inbox[0])
        if($scope.inbox[0].bucket === '1'){
          console.log('should call the manageTimer')
            manageTimer();
        }else if($scope.inbox[0].bucket === '2'){
            focusTimer();
        }else if ($scope.inbox[0].bucket === '3'){
            avoidTimer();
        }else if ($scope.inbox[0].bucket === '4'){
            limitTimer();
        }
      };

      $scope.send = function(){
        var message = '###' + $('#to').val() + '###' + $('#subject').val() + '###' + $('#message').val();
        SendMessageFactory.sendMessage(message)
          .then(function(response){
            // console.log(response);
          });
        var id = $scope.inbox[0]._id;
        var tag = 'replied';
        var bucket = $scope.inbox[0].bucket;
        UpdateEmailTag.update(id + '###' + tag + '###' + bucket);
        Inbox.shiftQ();
        $interval.cancel(timerId);
        updatePoints();
        bucketChecker();
        $('#subject').val('');
        $('#message').val('');
      };

      $scope.next = function(){
        Inbox.shiftQ();
        $interval.cancel(timerId);
        updatePoints();
        bucketChecker();
      };

      $scope.markAsRead = function(){
        var messageID = $scope.inbox[0].id;
        SendMessageFactory.markingAsRead(messageID);
      };
    
      bucketChecker();
    });
})

.controller('mantra',function($scope, Inbox){
  Inbox.getSortedInbox(function(emails){
    $scope.inbox = emails;
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
  });
})