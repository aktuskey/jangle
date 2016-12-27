var assert = require('assert'),
	auth = require('./auth');

describe('auth', function () {

	var req = {};

	beforeEach(function () {

		req = {
			query: {
				username: 'admin',
				password: 'password'
			}
		};

	})

	it('calls my function', function (done) {

		req.query = {};

		auth(req, {}, done);

	});

	it('modifies req.res', function (done) {

		auth(req, {}, function () {

			assert.notEqual(req.res, null);
			done();

		});

	});

	it('returns token on success', function (done) {

		auth(req, {}, function () {

			assert.equal(req.res.status, 200);
			assert.notEqual(req.res.data[0].token, null);

			done();

		});

	});

	it('provides different message on missing credentials', function (done) {

		var badCredentialsMessage = '',
			missingCredentialsMessage = '';

		req.query.username = 'incorrect';

		auth(req, {}, function () {

			badCredentialsMessage = req.res.message;

			req = {
				query: {}
			};

			auth(req, {}, function () {

				missingCredentialsMessage = req.res.message;

				assert.notEqual(badCredentialsMessage, null);
				assert.notEqual(missingCredentialsMessage, null);
				assert.notEqual(missingCredentialsMessage, badCredentialsMessage);

				done();

			});


		})

	});

});