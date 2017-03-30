let assert = require('assert')
let routes = require('./routes')

describe('api/routes', function () {
  let func = (functionName) => {
    return (req, res, next) => {
      if (req.mockFunctions === undefined) {
        req.mockFunctions = []
      }

      req.mockFunctions.push(functionName)

      next()
    }
  }
  let newRouter = function () {
    let _data = {
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
      },

      data: _data
    }
  }

  let api
  let router

  beforeEach(function () {
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
        ping: func('public.ping'),
        auth: func('public.auth')
      }
    }

    router = routes(api, newRouter())
  })

  it('router data is defined', () => {
    assert.notEqual(router.data, undefined)
  })
})
