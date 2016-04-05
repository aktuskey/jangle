module.exports = ['UserDataService', '$location', function(UserDataService, $location){
  
    var ctrl = this;

    ctrl.showSignUpModal = false;
    ctrl.showUserInfoModal = false;

    ctrl.user = UserDataService.user;

    ctrl.learnMoreClicked = function() {
        ctrl.showModal = true;
    };

    ctrl.onSignUp = function(email, password) {
        
        if(email == null)
            return;

    	ctrl.showSignUpModal = false;

    	var promise = UserDataService.signIn(email, password);

    	promise.then(function(res){
            ctrl.showUserInfoModal = true;
    	})
    };

    ctrl.onUserInfo = function(name) {

        ctrl.showUserInfoModal = false;

        var promise = UserDataService.setName(name);

        $location.path('/dashboard');
    };
  
}];