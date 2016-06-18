module.exports = ['ApiService', function(ApiService){
    var srvc = this;
    srvc.data = {};

    // Hashing function
    var crypto = require('crypto');
    
    var hash = function(password){
        return crypto.createHash('sha256').update(password).digest('base64');
    };

    srvc.getCachedUser = function(){

        // Get token if available
        var token = ApiService.getToken();

        return ApiService.get('user', {
            token: token
        }).then(function(res){
            srvc.data.user = {};
            srvc.data.user.username = res.data.username;
            srvc.data.user.role = res.data.role;
            return res;
        });
    };

    srvc.signIn = function(username, password){

        return ApiService.signIn({
            username: username,
            password: hash(password)
        })
        .then(function(res){
            console.log(res);
            srvc.data.user = res.data;
            return res;
        });
    };

}];