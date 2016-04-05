module.exports = ['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider){

    $routeProvider.
        when('/', {
            template: '<login-page></login-page>'
        })
        .when('/dashboard', {
            template: '<dashboard-page></dashboard-page>'
        })
        .otherwise({
            redirectTo: '/oops'
        });

    $locationProvider.html5Mode(true);
}];