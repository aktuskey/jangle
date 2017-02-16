let assert = require('assert'),
	routes = require('./routes'),
	DISCONNECTED = 0,
	CONNECTED = 1

describe('api/routes', function () {

	let api = {},
		router = {},
		func = (functionName) => ((req, res, next) => {

			req.mockFunctions.push(functionName)

			next()

		}),
		newRouter = function(){

			var _data = {
				get: [],
				put: [],
				post: [],
				delete: [],
				routes: []
			}

			return {

				route: function (route) {

					var childRoute = newRouter()

					_data.routes.push(childRoute)

					return childRoute

				},

				all: function (middleware) {

					_data.get.push(middleware)
					_data.post.push(middleware)
					_data.put.push(middleware)
					_data.delete.push(middleware)

					return this

				},

				get: function (middleware) {

					_data.get.push(middleware)

					return this

				},

				post: function (middleware) {

					_data.post.push(middleware)

					return this

				},

				put: function (middleware) {

					_data.put.push(middleware)

					return this

				},

				delete: function (middleware) {

					_data.delete.push(middleware)

					return this

				}

		}

	beforeEach( () => {

		api = {

			after: func('after'),

			collections: {

				before: () => func('collections.before'),
				get: func('collections.get'),
				post: func('collections.post'),
				put: func('collections.put'),
				delete: func('collections.delete')

			},

			alias: {

				metaCollection: func('alias.metaCollection'),
				metaCollectionWithId: func('alias.metaCollectionWithId'),
				collectionWithId: func('alias.collectionWithId')

			},

			public: {

				ping: func('public/ping'),
				auth: func('public/auth')

			}

		}

		router = newRouter()

	})

	// MONGOOSE CONNECTIONS
	it('closes open connections', function () {

		after(req, res)

		assert.equal(req.connection.readyState, DISCONNECTED)

	})

	// MONGOOSE CONNECTIONS
	it('maintains closed connections', function () {

		req.connection.readyState = DISCONNECTED

		after(req, res)

		assert.equal(req.connection.readyState, DISCONNECTED)

	})

	// STATUS CODE
	it('defaults status code to 500', function () {

		after(req, res)

		assert.equal(res._status, 500)

	})

	it('sets status code if given', function () {

		req.res.status = 200

		after(req, res)

		assert.equal(res._status, 200)

	})

	// ERRORS
	it('defaults error to true', function () {

		after(req, res)

		assert.equal(res._json.error, true)

	})

	it('infers error from good status code', function () {

		req.res.status = 200

		after(req, res)

		assert.equal(res._json.error, false)

	})

	it('infers error from bad status code', function () {

		req.res.status = 400

		after(req, res)

		assert.equal(res._json.error, true)

	})

	it('sets error when given', function () {

		req.res.error = false

		after(req, res)

		assert.equal(res._json.error, false)

	})

	// MESSAGE
	it('defaults message to empty string', function () {

		after(req, res)

		assert.equal(res._json.message, '')

	})

	it('sets message when given', function () {

		req.res.message = 'Test passed!'

		after(req, res)

		assert.equal(res._json.message, 'Test passed!')

	})

	// DATA
	it('defaults data to empty array', function () {

		after(req, res);

		assert.deepEqual(res._json.data, []);

	})

	it('sets data when given', function () {

		req.res.data = [1, 2, 3];

		after(req, res);

		assert.deepEqual(res._json.data, [1, 2, 3]);

	})

})
