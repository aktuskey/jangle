module.exports = ['ApiService', function(ApiService){
    var srvc = this;
    srvc.data = {};

    srvc.signIn = function(username, password){

        console.log(ApiService.get('user',{
            username: username,
            password: password
        }));

    };

}];