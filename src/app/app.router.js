module.exports = ['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider){

    $routeProvider.
        when('/', {
            template: '<login-page></login-page>'
        })
        .when('/machine-admin', {
            template: '<machine-admin-page></machine-admin-page>'
        })
        .otherwise({
            redirectTo: '/oops'
        });

    $locationProvider.html5Mode(true);
}];