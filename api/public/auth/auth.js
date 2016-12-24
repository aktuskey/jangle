module.exports = function (req, res, next) {

	req.res = {
		status: 400,
		message: 'Authentication failed.',
		data: []
	};

	next();

};