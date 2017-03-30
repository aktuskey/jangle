module.exports = {

  handleRejection: function (req, res, done) {
    return function (reason) {
      console.error(reason)

      req.res.message = reason

      done(req, res)
    }
  },

  handleConnectionError: function (req, reject) {
    let message = `Can't connect to the database.`

    req.res = {
      status: 500,
      message: message,
      data: []
    }

    reject(message)
  },

  handleCreateError: function (error) {
    let message = `There was a problem adding the new document.`

    if (error.name === 'ValidationError') {
      message = `The 'data' option failed validation.`

      let errorList = Object.keys(error.errors).map(x => error.errors[x])

      let requiredFieldErrors = errorList.filter(x => x.kind === 'required')

      if (requiredFieldErrors.length > 0) {
        let missingRequiredFields =
            requiredFieldErrors.map(x => x.path)

        message = `Missing required fields: ${missingRequiredFields}`
      } else if (error.errors.name) {
        message = error.errors.name.message
      }
    } else if (error.name === 'MongoError') {
      message = `There was a problem with MongoDB.`

      switch (error.code) {
        case 11000:
          message = `A document with that key already exists.`
          break
      }
    }

    return message
  }
}
