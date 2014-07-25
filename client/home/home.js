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
.controller('HomeController', function($scope, $state, $q, ProfileFactory, LoginFactory) {
  LoginFactory.loginCheck()
  .then(function(response){
    if (response === 'false'){
      $state.transitionTo('myApp.public.login')
    } else {
      var usrProfile = ProfileFactory.getProfile()
        .then(function(usrProfile){
          $scope.fullName = usrProfile.fullName;
      	  $scope.userEmail = usrProfile.userEmail;
          $scope.profilePhoto = usrProfile.profilePhoto;
        })
    }
  })
})

//controller for badges 

.controller('BadgeController', function($scope, PointFactory) {
  $scope.points = PointFactory.getPoints();

  $scope.badgeOneShower = function () {
    if ($scope.points >= 100) {
      return true;
    }
    else return false;
  };
  $scope.badgeTwoShower = function () {
    if ($scope.points >= 500) {
      return true;
    }
     else return false;
  };
  $scope.badgeThreeShower = function () {
    if ($scope.points >= 800) {
      return true;
    }
     else return false;
  };
  $scope.badgeFourShower = function () {
    if ($scope.points >= 1000) {
      return true;
    }
     else return false;
  };
});

