module.exports = ['$location', 'UserService', function($location, UserService){
	var ctrl = this;

	ctrl.title = 'Jangle';
	ctrl.userServiceData = UserService.data;

	ctrl.links = [
		{
			label: 'Collections',
			icon: 'fa-th-list',
			link: '/jangle/collections'
		},
		{
			label: 'User Roles',
			icon: 'fa-users',
			link: '/jangle/roles',
			disabled: true
		}
	];

	ctrl.onUserLinkClicked = function(){
		UserService.signOut().then(ctrl.getCachedUser);
	};

	ctrl.getCachedUser = function(){
		UserService.getCachedUser();
	};

	ctrl.isActiveLink = function(link){
		return $location.path() == link;
	};
}]