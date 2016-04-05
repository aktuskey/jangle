module.exports = ['UserDataService', '$location', function(UserDataService, $location){
  
    var ctrl = this;

    ctrl.showSignUpModal = false;

    ctrl.user = UserDataService.user;

    ctrl.learnMoreClicked = function() {
        ctrl.showModal = true;
    };

    ctrl.onSignUp = function(email, password) {
    	ctrl.showSignUpModal = false;

    	var promise = UserDataService.signIn(email, password);

    	promise.then(function(res){
    		$location.path('/dashboard');
    	})
    };
  
}];