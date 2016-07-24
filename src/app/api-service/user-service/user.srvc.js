module.exports = ['ApiService', '$location', function(ApiService, $location){
    var srvc = this;
    srvc.data = {};

    // Hashing function
    var crypto = require('crypto');
    
    var hash = function(password){
        return crypto.createHash('sha256').update(password).digest('base64');
    };

    srvc.getCachedUser = function(){

        return ApiService.get('user')
            .then(function(res){
                srvc.data.user = {};
                srvc.data.user.username = res.data.username;
                srvc.data.user.role = res.data.role;
                return res;
            })
            .catch(function(res){
                $location.path('/jangle/login');
                return res;
            });
    };

    srvc.signIn = function(username, password){

        return ApiService.signIn({
            username: username,
            password: hash(password)
        })
        .then(function(res){
            srvc.data.user = res.data;
            return res;
        });

    };

    srvc.signOut = function(){

        return ApiService.signOut()
        .then(function(res){

            srvc.data.user = null;
            return res;

        });

    };

}];