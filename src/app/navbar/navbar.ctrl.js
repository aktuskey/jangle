module.exports = ['UserDataService', '$location', function(UserDataService, $location){
	var ctrl = this;

	ctrl.user = UserDataService.user;
	ctrl.title = 'MongoCMS';

	ctrl.route = function(){
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