angular.module('myApp.public.login', ['ui.router'])

.config(function($stateProvider) {

  $stateProvider
    .state('myApp.public.login', {
      url: '/login',
      templateUrl: 'login/login.tpl.html',
      controller: 'LoginController'
    });
})

//this is dummy data to test the list of inbox emails	
.controller('LoginController', function($scope) {
	
})
