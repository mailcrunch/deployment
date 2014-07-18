
  "use strict";
  angular.module('myApp.main.spinner', ['ui.router'])
  .config(function ($stateProvider){
    $stateProvider
      .state('myApp.main.spinner', {
        url: '/spinner',
        templateUrl: 'spinner/spinner.tpl.html',
        controller: 'SpinnerController'
      })
  })
  .controller('SpinnerController', function($state,$scope,$timeout,InboxFactory, Inbox) {
    $scope.spinner = 0;
    InboxFactory.getEm()
      .then(function(response){
        $scope.spinner = response.data.length;
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
            Inbox.inbox.push($scope.email); 
          }
        }
        $timeout(function(){
          $state.transitionTo('myApp.main.note')
        }, 5000)
      })
  })

