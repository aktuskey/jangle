module.exports = ['$location', 'UserService', function($location, UserService){
	var ctrl = this;

	ctrl.title = 'MongoCMS';
	ctrl.userServiceData = UserService.data;

	ctrl.links = [
		{
			label: 'MongoCMS',
			icon: 'fa-database',
			link: '/mongo-cms/dashboard'
		},
		{
			label: 'Collections',
			icon: 'fa-th-list',
			link: '/mongo-cms/collections'
		},
		{
			label: 'User Roles',
			icon: 'fa-users',
			link: '/mongo-cms/roles'
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