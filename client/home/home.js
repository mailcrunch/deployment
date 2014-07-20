angular.module('myApp.main.home', ['ui.router'])

.config(function($stateProvider) {

  $stateProvider
    .state('myApp.main.home', {
      url: '/home',
      templateUrl: 'home/home.tpl.html',
      controller: 'HomeController'
    });
})

//this is dummy data to test the list of inbox emails	
.controller('HomeController', function($scope, ProfileFactory) {

	$scope.firstName = ProfileFactory.firstName || "John";
	$scope.lastName = ProfileFactory.lastName || "Snow";
	$scope.userEmail = ProfileFactory.userEmail || "example@gmail.com";

})

