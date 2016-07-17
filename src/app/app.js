angular.module(module.exports='app', [
  require('shared/navbar'),
  require('pages'),
  require('angular-route'),
  require('api-service')
])
  .config(require('./app.router'))
;