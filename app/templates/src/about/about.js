(function () {
    'use strict';

    angular
        .module('<%= ngApp %>')
        .config(About);

    function About($stateProvider) {
        $stateProvider
            .state('about', {
                url: '/',
                controller: AboutCtrl,
                templateUrl: '<%= assetDir ? assetDir + "/" : "" %>about/about.html',
            });
    }

    function AboutCtrl($scope) {

    }
})();
