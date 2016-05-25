module.exports = ['UserService', function(UserService){

    var ctrl = this;

    ctrl.userData = UserService.data;
    ctrl.onSignIn = function() {

        ctrl.signingIn = true;
        ctrl.inputClass = '';

        UserService.signIn(ctrl.username, ctrl.password)
            .then(function(res){
                if(ctrl.onSubmit)
                    ctrl.onSubmit();
            })
            .catch(function(err){
                console.log(err);
                ctrl.inputClass = 'is-danger';
            })
            .then(function(res){
                ctrl.signingIn = false;
            });

    };

}];