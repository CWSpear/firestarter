(function () {
    'use strict';

    angular
        .module('<%= ngApp %>')
        .config(Contact);

    function Contact($stateProvider) {
        $stateProvider
            .state('contact', {
                url: '/contact',
                controller: ContactCtrl,
                templateUrl: '<%= assetDir ? assetDir + "/" : "" %>contact/contact.html',
            });
    }

    function ContactCtrl($scope) {

    }
})();
