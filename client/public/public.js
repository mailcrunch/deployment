(function (angular) {
  "use strict";
  angular.module('myApp.public', ['ui.router', 'myApp.public.login', 'myApp.public.about'])
  
  .config(function ($stateProvider) {
    $stateProvider
      .state('myApp.public', {
        url: '/public',
        templateUrl: 'public/public.tpl.html',
        controller: 'PublicController'
      });
  })

  .controller('PublicController', function($state) {
    $state.transitionTo('myApp.public.login');
  });
}(angular));
  