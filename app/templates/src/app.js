angular.module('<%= ngApp %>', ['ui.router', 'ngAnimate', 'restangular'])

.config(function ($stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
})

.run(function ($rootScope, $location, watchPort) {
    if (watchPort) {
        // browserSync
        var script = document.createElement('script');
        script.src = '//HOST:PORT/browser-sync/browser-sync-client.js'
            .replace(/HOST/g, location.hostname)
            .replace(/PORT/g, watchPort);
        document.body.insertBefore(script, null);
    }
});
