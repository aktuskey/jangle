module.exports = ['UserService', function(UserService){

    var ctrl = this;

    ctrl.userData = UserService.data;

    ctrl.onSignIn = function() {

        ctrl.signingIn = true;

        UserService.signIn(ctrl.username, ctrl.password);

    };

}];