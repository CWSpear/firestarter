(function () {
    angular
        .module('<%= ngApp %>', [
            'ui.router',
            'ngAnimate',
            'restangular',
        ])
        .run(run);

    function run($rootScope, $location, watchPort) {
        if (watchPort) {
            // browserSync
            var script = document.createElement('script');
            script.src = '//HOST:PORT/browser-sync/browser-sync-client.js'
                .replace(/HOST/g, location.hostname)
                .replace(/PORT/g, watchPort);
            document.body.insertBefore(script, null);
        }
    }
})();
