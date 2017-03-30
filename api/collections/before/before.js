module.exports = function (done) {
  return function (req, res, next) {
    let handleRejection =
        req.utilities.logging.handleRejection(req, res, done)
    let checkForUserTokenTask =
      checkForUserToken(req)
    let getMongoConnectionTask =
      req.utilities.database.getMongoConnection(req)
    let getModelTask =
      getModel(req)

    checkForUserTokenTask()
      .success(getMongoConnectionTask)
      .success(getModelTask)
      .then(() => {
        console.log(`\n${req.method}:\t${req.params.collectionName}`)
        next()
      }, handleRejection)
  }
}

let checkForUserToken = function (req) {
  return function () {
    return new req.Promise(function (resolve, reject) {
      req.token = req.query.token || req.body.token

      if (req.token === undefined) {
        // Only allow get requests to public database
        if (req.method !== 'GET') {
          let message =
            `A token is required for ${req.method} requests.`

          req.res = ({
            status: 401,
            message: message,
            data: []
          })

          reject(req.res.message)
        } else {
          resolve()
        }
      } else {
        let ADMIN_TOKEN = req.env.ADMIN_TOKEN || 'token'

        if (req.token !== ADMIN_TOKEN) {
          req.res = {
            status: 401,
            message: 'Invalid token.',
            data: []
          }

          reject(req.res.message)
        } else {
          resolve()
        }
      }
    })
  }
}

let getModel = function (req) {
  return function () {
    return new req.Promise(function (resolve, reject) {
      let collectionName = req.params.collectionName
      req.utilities.database.getModel(
        req,
        collectionName,
        function (model) {
          req.model = model

          req.Model = req.connection.model(
              model.modelName,
              model.schema
          )

          resolve()
        },
        reject
      )
    })
  }
}
