(function (angular) {
  "use strict";
  angular.module('myApp.main', ['ui.router', 'myApp.main.crunch', 'myApp.main.note', 'myApp.main.home', 'myApp.main.signup', 'myApp.main.login'])
  .config(function ($stateProvider){
    $stateProvider
      .state('myApp.main', {
        url: '/main',
        templateUrl: 'main/main.tpl.html',
        controller: 'MainController'
      })
  })
  .controller('MainController', function($state) {
    $state.transitionTo('myApp.main.login');
  })
  .controller('PointController', function($scope, $interval, PointFactory){
    $scope.points = 0;
    $interval(function(){
      $scope.points = PointFactory.getPoints();
    }, 1000)
  })
}(angular));
  