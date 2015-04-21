(function () {
    'use strict';

    angular
        .module('<%= ngApp %>')
        .config(About);

    function About($stateProvider) {
        $stateProvider
            .state('about', {
                url: '/about',
                controller: AboutCtrl,
                templateUrl: '<%= assetDir ? assetDir + "/" : "" %>about/about.html',
            });
    }

    function AboutCtrl($scope) {

    }
})();
