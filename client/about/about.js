angular.module('myApp.public.about', ['ui.router'])

.config(function($stateProvider) {

  $stateProvider
    .state('myApp.public.about', {
      url: '/about',
      templateUrl: 'about/about.tpl.html',
      controller: 'AboutController'
    });
})

.controller('AboutController', function($scope) {
});
