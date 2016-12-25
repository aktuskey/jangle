var assert = require('assert'),
	before = require('./before.js'),
	DISCONNECTED = 0,
	CONNECTED = 1;

describe('middleware/all/before', function () {

	var req = {},
		res = {};

	beforeEach(function () {

		req = {
			method: 'GET',
			query: {}
		};

		res = {
			_status: null,
			_json: null,
			status: function (newStatus) {
				this._status = newStatus;
				return this;
			},
			json: function (newJson) {
				this._json = newJson;
				return this;
			}
		};

	});

	afterEach(function () {

		if (req.connection && req.connection.readyState == CONNECTED) {
			req.connection.close();
		}

	});

	it('handles invalid requests', function (done) {

		req.done = function () {

			try {

				assert.equal(req.res.error, true);
				assert.deepEqual(req.res.data, []);

				done();

			} catch (e) {

				done(e);

			}

		};

		before(req, res, req.done);

	});


	it('disallows PUT without token', function (done) {

		req.method = 'PUT';

		req.done = function () {

			try {

				assert.equal(req.res.status, 401);

				done();

			} catch (e) {

				done(e);

			}

		};

		before(req, res, req.done);

	});


	it('allows public GET without token', function (done) {

		req.done = function () {

			try {

				assert.notEqual(req.res.status, 401);
				assert.equal(req.useLiveDatabase, true);

				done();

			} catch (e) {

				done(e);

			}

		};

		before(req, res, req.done);

	});


	it('allows PUT with token', function (done) {

		req.method = 'PUT';

		req.query = {
			token: 'test'
		};

		req.done = function () {

			try {

				assert.notEqual(req.res.status, 401);
				assert.equal(req.useLiveDatabase, false);

				done();

			} catch (e) {

				done(e);

			}

		};

		before(req, res, req.done);

	});

});