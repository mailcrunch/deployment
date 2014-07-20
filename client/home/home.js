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

    $scope.firstName = ProfileFactory.getProfile;
	$scope.firstName = ProfileFactory.firstName;
	$scope.lastName = ProfileFactory.lastName;
	$scope.userEmail = ProfileFactory.userEmail;

})

