angular.module(module.exports='navbar', [])

    .component('navbar', {
        templateUrl: 'templates/shared/navbar/navbar.html',
        controller: require('./navbar.ctrl')
    })