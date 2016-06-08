module.exports = ['$http', function($http){
    
    var srvc = this;
    var TOKEN_KEY = 'mongo-cms-auth-token';

    srvc.baseUrl = '/api/';

    srvc.signIn = function(data){
        return srvc.request('GET', 'sign-in', data, true);        
    };

    srvc.saveToken = function(token){
        localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    };

    srvc.getToken = function(){
        var string = localStorage.getItem(TOKEN_KEY);
        return JSON.parse(string);
    };

    srvc.resetToken = function(){
        localStorage.removeItem(TOKEN_KEY);
    }

    srvc.get = function(route, data) {
        return srvc.request('GET', route, data);
    };

    srvc.post = function(route, data) {
        return srvc.request('POST', route, data);
    };

    srvc.put = function(route, data) {
        return srvc.request('PUT', route, data);
    };

    srvc.delete = function(route, data) {
        return srvc.request('DELETE', route, data);
    };

    srvc.request = function(method, route, data, isSignIn) {

        if(!isSignIn)
            data.token = srvc.getToken();

        return $http({
            method: method,
            url: srvc.baseUrl + route,
            params: data
        }).then(function(res){

            if(isSignIn)
                srvc.saveToken(res.data.token);

            return res;

        });

    };


}];