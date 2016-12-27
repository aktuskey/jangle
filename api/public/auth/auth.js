module.exports = function (req, res, next) {

	var username = req.query.username;
	var password = req.query.password;

	// TODO: Legitimate authentication pls.
	var ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
	var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
	var ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'token';

	if (username == null || password == null) {

		req.res = {
			status: 400,
			message: 'Please provide username and password.',
			data: []
		};

	} else if (username == ADMIN_USERNAME && password == ADMIN_PASSWORD) {

		req.res = {
			status: 200,
			message: 'Authentication successful!',
			data: [{
				token: ADMIN_TOKEN
			}]
		};

	} else {
		req.res = {
			status: 400,
			message: 'Authentication failed.',
			data: []
		};
	}

	next();

};