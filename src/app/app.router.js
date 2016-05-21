module.exports = ['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider){

    $routeProvider.
        when('/login', {
            template: '<login-page></login-page>'
        })
        .when('/dashboard', {
            template: '<dashboard-page title="Dashboard"></dashboard-page>'
        })
        .when('/collections', {
            template: '<dashboard-page title="Collections"></dashboard-page>'
        })
        .when('/roles', {
            template: '<dashboard-page title="Roles"></dashboard-page>'
        })
        .when('/user', {
            template: '<dashboard-page title="User"></dashboard-page>'
        })
        .otherwise({
            redirectTo: '/login'
        });

    $locationProvider.html5Mode(true);
}];