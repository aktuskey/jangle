require('angular').module(module.exports="LoginPage", [
    require('navbar')
])
    .component('loginPage', {
        templateUrl: 'templates/pages/login-page/login-page.html',
        controller: require('pages/login-page/login-page.ctrl')
    })
