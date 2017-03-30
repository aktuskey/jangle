module.exports = function (req, res, next) {
  let Model = req.Model
  let queryOptions = req.utilities.database.getQueryOptions(req)
  let getDeltas = req.utilities.database.getDeltas

  Model.find(queryOptions.where).exec(function (err, documents) {
    if (err) {
      console.error(err)

      req.res = {
        status: 400,
        message: 'Error updating documents',
        data: []
      }

      next()
    } else if (documents.length === 0) {
      req.res = {
        status: 200,
        message: 'No documents to update',
        data: []
      }

      next()
    } else {
      let count = documents.length
      let units = count === 1 ? 'document' : 'documents'
      let deltas = getDeltas(documents, queryOptions.set, queryOptions.unset)
      let documentsProcessed = 0
      let documentsUpdated = 0
      let newDocuments = []

      documents.map((document, index) => {
      // Update document version array
        document.jangle.previousVersions.push(deltas[index])

        let updates = {}

        if (queryOptions.set !== undefined && Object.keys(queryOptions.set).length > 0) {
          updates.$set = queryOptions.set
        }

        if (queryOptions.unset !== undefined && Object.keys(queryOptions.unset).length > 0) {
          updates.$unset = queryOptions.unset
        }

        if (queryOptions.set && Object.keys(queryOptions.set).length > 0) {
          updates['jangle.previousVersions'] = document.jangle.previousVersions
        }

        Model.update({ '_id': document._id }, updates, function (err, result) {
          if (err) {
            console.error(err)
          } else {
            documentsUpdated++
            newDocuments.push({
              _id: document.id,
              previousVersion: deltas[index]
            })
          }

          documentsProcessed++

          if (documentsProcessed === count) {
            req.res = {
              status: 200,
              message: `Updated ${documentsUpdated} ${units}.`,
              data: newDocuments
            }

            next()
          }
        })
      })
    }
  })
}
