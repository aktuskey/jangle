require('angular').module(module.exports='navbar', [])

    .component('navbar', {
        templateUrl: 'templates/navbar/navbar.html',
        controller: require('navbar/navbar.ctrl')
    })