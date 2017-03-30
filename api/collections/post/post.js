module.exports = function (req, res, next) {
  let Model = req.Model
  let documents = req.query.documents
  let newDocuments
  let parseError = false

  try {
    newDocuments = JSON.parse(documents)
  } catch (ignore) {
    parseError = true
  }

  if (newDocuments !== undefined && newDocuments.length > 0) {
    let count = newDocuments.length
    let units = count === 1 ? 'document' : 'documents'

    // TODO: Might need to fix if Model doesn't fire index event
    Model.on('index', () => {
      Model.create(newDocuments, function (err, documents) {
        if (err) {
          let handleCreateError = req.utilities.logging.handleCreateError

          req.res = {
            status: 400,
            message: handleCreateError(err),
            data: []
          }
        } else {
          req.res = {
            status: 201,
            message: `Added ${count} ${units}.`,
            data: documents
          }
        }

        next()
      })
    })
  } else if (parseError) {
    req.res = {
      status: 400,
      message: `Could not parse the 'documents' parameter.`,
      data: []
    }

    next()
  } else {
    req.res = {
      status: 400,
      message: `Please include the 'documents' parameter.`,
      data: []
    }

    next()
  }
}
