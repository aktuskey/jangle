angular.module(module.exports="loginPage", [
    require('shared/modal'),
    require('shared/sign-up-form')
])
    .component(module.exports, {
        templateUrl: 'templates/pages/login-page/login-page.html',
        controller: require('pages/login-page/login-page.ctrl')
    })
