var angular = require('angular');

angular.module(module.exports='app', [
  require('pages'),
  require('angular-route'),
  require('api-service')
])
  .config(require('./app.router'))
;