var angular = require('angular');

angular.module(module.exports='app', [
  require('navbar'),
  require('pages'),
  require('angular-route'),
  require('user-data-service')
])
  .config(require('./app.router'))
;