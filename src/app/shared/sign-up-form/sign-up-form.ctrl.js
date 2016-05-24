module.exports = ['UserService', function(UserService){

    var ctrl = this;

    ctrl.userData = UserService.data;
    ctrl.onSignIn = function() {

        ctrl.signingIn = true;
        ctrl.error = '';

        UserService.signIn(ctrl.username, ctrl.password)
            .then(function(res){
                if(ctrl.onSubmit)
                    ctrl.onSubmit();
            })
            .catch(function(err){
                console.log(err);
                ctrl.error = err.data;
            })
            .then(function(res){
                ctrl.signingIn = false;
            });

    };

}];