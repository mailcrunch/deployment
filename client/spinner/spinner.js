
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
  .controller('SpinnerController', function($state, $scope, $timeout, InboxFactory, Inbox, LoginFactory) {
    $scope.spinner = '...';
    LoginFactory.loginCheck()

    .then(function(response){
      if (response === 'false'){
        $state.transitionTo('myApp.public.login')
      } else {
      InboxFactory.getEm()
        .then(function(response){
      console.log('got here');
          $scope.spinner = response.data.length;
          if (response.data === 'no messages today'){
            $scope.spinner = 0;
            $timeout(function(){
              $state.transitionTo('myApp.main.crunch')
            }, 3000)
          }

          // clear inbox before populating with messages
          Inbox.clear();

          // process new messages if found
          // MailCrunch server responds with "no messages today" when no unseen messages found
          if (response.data !== 'no messages today') {
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
            // if (Inbox.inbox.length > response.data.length){
            //   Inbox.inbox.length = response.data.length;
            // }
            $timeout(function(){
              $state.transitionTo('myApp.main.note')
            }, 4000);
          }
        })
      }
    })
  })

