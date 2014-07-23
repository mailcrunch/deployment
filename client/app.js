(function (angular) {
  "use strict";
  angular.module('myApp', [
    'ngFx',
    'emailParser',
    'ngSanitize',
    'ui.router',
    'ngAnimate',
    'fx.animations',
    'myApp.public',
    'myApp.main'])
  .config(function($stateProvider) {
    $stateProvider
      .state('myApp', {
        abstract: true,
        template: '<ui-view></ui-view>'
      });
  })
  .run(function ($state) {
    $state.transitionTo('myApp.public');
  });
}(angular));



