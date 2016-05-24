module.exports = ['ApiService', function(ApiService){
    var srvc = this;
    srvc.data = {};

    // Hashing function
    var crypto = require('crypto');
    var hash = function(password){
        return crypto.createHash('sha256').update(password).digest('base64');
    };

    srvc.signIn = function(username, password){

        return ApiService.get('user',{
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