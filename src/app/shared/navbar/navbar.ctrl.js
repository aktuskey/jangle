module.exports = ['$location', 'UserService', function($location, UserService){
	var ctrl = this;

	ctrl.title = 'MongoCMS';
	ctrl.userServiceData = UserService.data;

	ctrl.links = [
		{
			label: 'MongoCMS',
			icon: 'fa-database',
			link: '/dashboard'
		},
		{
			label: 'Collections',
			icon: 'fa-th-list',
			link: '/collections'
		},
		{
			label: 'User Roles',
			icon: 'fa-users',
			link: '/roles'
		}
	];

	ctrl.getCachedUser = function(){
		UserService.getCachedUser();
	};

	ctrl.isActiveLink = function(link){
		return $location.path() == link;
	}

	ctrl.route = function(){

	};
}]