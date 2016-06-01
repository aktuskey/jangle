module.exports = ['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider){

    $routeProvider.
        when('/login', {
            template: '<login-page></login-page>'
        })
        .when('/dashboard', {
            template: '<navbar></navbar>dashboard'
        })
        .when('/collections', {
            template: '<collections-page></collections-page>'
        })
        .when('/roles', {
            template: '<navbar></navbar>roles'
        })
        .when('/user', {
            template: '<navbar></navbar>user'
        })
        .otherwise({
            redirectTo: '/login'
        });

    $locationProvider.html5Mode(true);
}];