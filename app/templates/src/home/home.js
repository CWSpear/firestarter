(function () {
    'use strict';

    angular
        .module('<%= ngApp %>')
        .config(Home);

    function Home($stateProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                controller: HomeCtrl,
                templateUrl: '<%= assetDir ? assetDir + "/" : "" %>home/home.html',
            });
    }

    function HomeCtrl($scope) {

    }
})();
