var assert = require('assert'),
	auth = require('./auth');

describe('auth', function () {

	it('calls my function', function (done) {

		auth({}, {}, done);

	});

	it('modifies req.res', function (done) {

		var req = {
			params: {
				username: 'name',
				password: 'password'
			}
		};

		auth(req, {}, function () {

			assert.notEqual(req.res, null);
			done();

		});

	});

});