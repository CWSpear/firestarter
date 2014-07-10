angular.module('awesomeDestroyerApp', ['ngRoute', 'ngAnimate'])

.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $routeProvider
        .when('/', {
            controller: 'HomeCtrl',
            templateUrl: 'views/home.html'
        })
        .when('/about/', {
            controller: 'AboutCtrl',
            templateUrl: 'views/about.html'
        })
        .when('/contact/', {
            controller: 'ContactCtrl',
            templateUrl: 'views/contact.html'
        });
})

.run(function ($rootScope, debug) {
    $rootScope.greeting = 'Hello world!';

    if (debug) {
        // browserSync
        var script = document.createElement('script');
        script.src = '//HOST:3000/browser-sync-client.js'.replace(/HOST/g, location.hostname);
        document.body.insertBefore(script, null);
    }
});