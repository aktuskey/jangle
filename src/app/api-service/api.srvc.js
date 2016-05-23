module.exports = ['$http', function($http){
	var srvc = this;
	srvc.data = {};

    var baseUrl = '/_api';

    srvc.get = function(url, data){
        return _request('GET', url, data);
    };

    _request = function(method, url, data) {

        return method + ' ' + baseUrl + '/' + url;

    };

}];