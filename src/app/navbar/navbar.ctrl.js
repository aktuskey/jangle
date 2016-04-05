module.exports = ['UserDataService', '$location', function(UserDataService, $location){
	var ctrl = this;

	ctrl.user = UserDataService.user;

	ctrl.checkUser = function(){
		if($location.path() == '/dashboard' && ctrl.user.email == null)
		{
			$location.path('/');
		}
		else if($location.path() == '/' && ctrl.user.email != null)
		{
			$location.path('/dashboard');
		}

	};
}]