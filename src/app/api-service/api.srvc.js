module.exports = ['$http', function($http){
    
    var srvc = this;
    var TOKEN_KEY = 'mongo-cms-auth-token';

    srvc.baseUrl = '/api/';

    // User Authentication
    srvc.signIn = function(data){
        return srvc.get('sign-in', data, true);        
    };

    srvc.saveToken = function(token){
        localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    };

    srvc.getToken = function(){
        return JSON.parse(localStorage.getItem(TOKEN_KEY));
    };

    srvc.resetToken = function(){
        localStorage.removeItem(TOKEN_KEY);
    };

    srvc.get = function(route, data, isSigningIn) {
        return srvc.request('GET', route, data, isSigningIn);
    };

    srvc.post = function(route, data, isSigningIn) {
        return srvc.request('POST', route, data, isSigningIn);
    };

    srvc.put = function(route, data, isSigningIn) {
        return srvc.request('PUT', route, data, isSigningIn);
    };

    srvc.delete = function(route, data, isSigningIn) {
        return srvc.request('DELETE', route, data, isSigningIn);
    };

    srvc.request = function(method, route, data, isSigningIn) {

        if(!data)
            data = {};

        if(!isSigningIn)
            data.token = srvc.getToken();

        return $http({
            method: method,
            url: srvc.baseUrl + route,
            params: data
        })
            .then(function(res){

                if(isSigningIn)
                    srvc.saveToken(res.data.token);

                return res;

            });

    };


}];