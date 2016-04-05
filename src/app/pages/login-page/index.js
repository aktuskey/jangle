require('angular').module(module.exports="LoginPage", [
    require('shared/modal'),
    require('shared/sign-up-form'),
    require('shared/user-info-form')
])
    .component('loginPage', {
        templateUrl: 'templates/pages/login-page/login-page.html',
        controller: require('pages/login-page/login-page.ctrl')
    })
