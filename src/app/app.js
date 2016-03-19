var angular = require('angular');

angular.module(module.exports='app', [
  require('./pages'),
  require('angular-route')
])
  .config(require('./app.router'))
;