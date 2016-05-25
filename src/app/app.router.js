module.exports = ['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider){

    $routeProvider.
        when('/login', {
            template: '<login-page></login-page>'
        })
        .when('/dashboard', {
            template: 'dashboard'
        })
        .when('/collections', {
            template: '<collections-page></collections-page>'
        })
        .when('/roles', {
            template: 'roles'
        })
        .when('/user', {
            template: 'user'
        })
        .otherwise({
            redirectTo: '/login'
        });

    $locationProvider.html5Mode(true);
}];