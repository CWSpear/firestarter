(function () {
    'use strict';

    angular
        .module('<%= ngApp %>')
        .config(Contact);

    function Contact($stateProvider) {
        $stateProvider
            .state('contact', {
                url: '/',
                controller: ContactCtrl,
                templateUrl: '<%= assetDir ? assetDir + "/" : "" %>contact/contact.html',
            });
    }

    function ContactCtrl($scope) {

    }
})();
