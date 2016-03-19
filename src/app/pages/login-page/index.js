require('angular').module(module.exports="LoginPage", [])

  .component('loginPage', {
    templateUrl: 'templates/pages/login-page/login-page.html',
    controller: require('./login-page.ctrl')
  })
