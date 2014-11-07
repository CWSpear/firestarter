angular.module('awesomeDestroyerApp', ['ui.router', 'ngAnimate', 'restangular'])

.config(function ($stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $stateProvider
        .state('home', {
            url: '/',
            controller: 'HomeCtrl',
            templateUrl: 'views/home.html'
        })
        .state('about', {
            url: '/about/',
            controller: 'AboutCtrl',
            templateUrl: 'views/about.html'
        })
        .state('contact', {
            url: '/contact/',
            controller: 'ContactCtrl',
            templateUrl: 'views/contact.html'
        });
})

.run(function ($rootScope, $location, debug, browserSyncPort) {
    if (debug) {
        // browserSync
        var script = document.createElement('script');
        script.src = '//HOST:PORT/browser-sync/browser-sync-client.js'
            .replace(/HOST/g, location.hostname)
            .replace(/PORT/g, browserSyncPort);
        document.body.insertBefore(script, null);
    }
});
