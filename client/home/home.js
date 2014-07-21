angular.module('myApp.main.home', ['ui.router'])

.config(function($stateProvider) {

  $stateProvider
    .state('myApp.main.home', {
      url: '/home',
      templateUrl: 'home/home.tpl.html',
      controller: 'HomeController'
    });
})

//this constroller calls a function that collects user profile data from 
// the database (via a factory) and returns it to the client for display
.controller('HomeController', function($scope, $q, ProfileFactory) {

  var usrProfile = ProfileFactory.getProfile()
  console.log(usrProfile);
  $scope.fullName = usrProfile.fullName;
	$scope.userEmail = usrProfile.userEmail;

