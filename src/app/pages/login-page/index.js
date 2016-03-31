require('angular').module(module.exports="LoginPage", [
    require('navbar'),
    require('shared/modal')
])
    .component('loginPage', {
        templateUrl: 'templates/pages/login-page/login-page.html',
        controller: require('pages/login-page/login-page.ctrl')
    })
