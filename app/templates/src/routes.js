angular.module('<%= ngApp %>')

.config(function ($stateProvider) {
    $stateProvider
        .state('home', {
            url: '/',
            controller: 'HomeCtrl',
            templateUrl: '<%= assetDir ? assetDir + "/" : "" %>home/home.html'
        })
        .state('about', {
            url: '/about/',
            controller: 'AboutCtrl',
            templateUrl: '<%= assetDir ? assetDir + "/" : "" %>about/about.html'
        })
        .state('contact', {
            url: '/contact/',
            controller: 'ContactCtrl',
            templateUrl: '<%= assetDir ? assetDir + "/" : "" %>contact/contact.html'
        });
});
