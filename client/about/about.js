angular.module('myApp.public.about', ['ui.router'])

.config(function($stateProvider) {

  $stateProvider
    .state('myApp.public.about', {
      url: '/about',
      templateUrl: 'about/about.tpl.html',
      controller: 'AboutController'
    });
})

//this is dummy data to test the list of inbox emails	
.controller('AboutController', function($scope) {
	
});
