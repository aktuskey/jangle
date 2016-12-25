var assert = require('assert'),
	after = require('./after'),
	DISCONNECTED = 0,
	CONNECTED = 1;

describe('middleware/all/after', function () {

	var req = {},
		res = {};

	beforeEach(function () {

		req = {

			res: {},

			connection: {
				readyState: CONNECTED,
				close: function () {
					this.readyState = DISCONNECTED;
				}
			}
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

	// MONGOOSE CONNECTIONS
	it('closes open connections', function () {

		after(req, res);

		assert.equal(req.connection.readyState, DISCONNECTED);

	});

	// MONGOOSE CONNECTIONS
	it('maintains closed connections', function () {

		req.connection.readyState = DISCONNECTED;

		after(req, res);

		assert.equal(req.connection.readyState, DISCONNECTED);

	});

	// STATUS CODE
	it('defaults status code to 500', function () {

		after(req, res);

		assert.equal(res._status, 500);

	});

	it('sets status code if given', function () {

		req.res.status = 200;

		after(req, res);

		assert.equal(res._status, 200);

	});

	// ERRORS
	it('defaults error to true', function () {

		after(req, res);

		assert.equal(res._json.error, true);

	});

	it('infers error from good status code', function () {

		req.res.status = 200;

		after(req, res);

		assert.equal(res._json.error, false);

	});

	it('infers error from bad status code', function () {

		req.res.status = 400;

		after(req, res);

		assert.equal(res._json.error, true);

	});

	it('sets error when given', function () {

		req.res.error = false;

		after(req, res);

		assert.equal(res._json.error, false);

	});

	// MESSAGE
	it('defaults message to empty string', function () {

		after(req, res);

		assert.equal(res._json.message, '');

	});

	it('sets message when given', function () {

		req.res.message = 'Test passed!';

		after(req, res);

		assert.equal(res._json.message, 'Test passed!');

	});

	// DATA
	it('defaults data to empty array', function () {

		after(req, res);

		assert.deepEqual(res._json.data, []);

	});

	it('sets data when given', function () {

		req.res.data = [1, 2, 3];

		after(req, res);

		assert.deepEqual(res._json.data, [1, 2, 3]);

	});



});