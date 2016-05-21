module.exports = ['$location', function($location){
	var ctrl = this;

	ctrl.title = 'MongoCMS';

	ctrl.links = {
		left: [
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
		],
		right: [
			{
				label: 'User',
				icon: 'fa-user',
				link: '/user'
			}
		]
	};

	ctrl.isActiveLink = function(link){
		return $location.path() == link;
	}

	ctrl.route = function(){

	};
}]