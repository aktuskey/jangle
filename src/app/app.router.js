module.exports = ['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider){

    $routeProvider.
        when('/login', {
            template: '<login-page></login-page>'
        })
        .when('/dashboard', {
            template: '<dashboard-page></dashboard-page>'
        })
        .otherwise({
            redirectTo: '/login'
        });

    $locationProvider.html5Mode(true);
}];