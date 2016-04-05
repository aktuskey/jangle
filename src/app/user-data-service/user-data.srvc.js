module.exports = [function(){

	var srvc = this;

	srvc.user = {};

	srvc.signIn = function(email, password) {
		return new Promise(function(resolve, reject) {

			console.log('Signing in ' + email);
			srvc.user.email = email;

			resolve(srvc.user);

		})
	};

	srvc.setName = function(name) {
		return new Promise(function(resolve, reject) {

			srvc.user.name = name;

			resolve(srvc.user);

		})
	}
}]