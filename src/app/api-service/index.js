angular.module(module.exports='ApiService', [
    require('api-service/user-service'),
    require('api-service/collection-service')
])
    .service(module.exports, require('./api.srvc.js'));