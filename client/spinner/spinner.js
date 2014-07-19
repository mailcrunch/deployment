
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
        // console.lo
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
            if (response.data[i].body === undefined){
              $scope.email.body = 'no message contents';
            } else {
              if (response.data[i].body.indexOf('<b>') > -1){
                response.data[i].body = response.data[i].body.slice(response.data[i].body.indexOf('<b>') + 3, response.data[i].body.lastIndexOf('</b>'));
              }
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
        //temporary bug fix for double emails?
        if (Inbox.inbox.length > response.data.length){
          Inbox.inbox.length = response.data.length;
        }
        $timeout(function(){
          $state.transitionTo('myApp.main.note')
        }, 5000)
      })
  })

