module.exports = ['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider){

    var MONGO_PREFIX = '/jangle'

    $routeProvider.
        when(MONGO_PREFIX + '/login', {
            template: '<login-page></login-page>'
        })
        .when(MONGO_PREFIX + '/dashboard', {
            template: '<navbar></navbar>dashboard'
        })
        .when(MONGO_PREFIX + '/collections', {
            template: '<collections-page></collections-page>'
        })
        .when(MONGO_PREFIX + '/roles', {
            template: '<navbar></navbar>roles'
        })
        .when(MONGO_PREFIX + '/user', {
            template: '<navbar></navbar>user'
        })
        .otherwise({
            redirectTo: MONGO_PREFIX + '/collections'
        });

    $locationProvider.html5Mode(true);
}];