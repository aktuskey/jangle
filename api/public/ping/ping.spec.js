let assert = require('assert'),
	ping = require('./ping');

describe('ping', function () {

	let req = {};

	beforeEach(function () {

		req.res = {
			status: 404,
			data: [1, 2, 3],
			message: ''
		};

	});

	it('returns status code 200', function (done) {

		ping(req, {}, function () {

			assert.strictEqual(req.res.status, 200);
			done();

		});

	});

	it('returns an empty data array', function (done) {

		ping(req, {}, function () {

			assert.strictEqual(req.res.data.length, 0);
			done();

		});

	})

});