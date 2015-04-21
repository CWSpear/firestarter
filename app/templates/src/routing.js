(function () {
    angular
        .module('<%= ngApp %>')
        .config(routingConfig)
        .run(routingRun);

    function routingConfig($stateProvider, $locationProvider) {
        $locationProvider.html5Mode(true).hashPrefix('!');

        // remove trailing slash :'-(
        $urlRouterProvider.rule(function ($injector, $location) {
            var path = $location.path();
            var newPath = path.replace(/\/$/, '');

            if (path != newPath) {
                var url = $location.url();
                var newUrl = url.replace(path, newPath);
                $location.url(newUrl);
            }
        });
    }

    function routingRun($rootScope, watchPort) {
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            // if no watchPort, it's most likely production
            if (!watchPort && window.ga) {
                setTimeout(function () {
                    // track page to Google Analytics
                    window.ga('send', 'pageview', {
                        page: $location.path(),
                        location: $location.absUrl()
                    });
                });
            }
        });
    }
})();
