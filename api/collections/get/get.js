module.exports = function (req, res, next) {
  let Model = req.Model
  let queryOptions = req.utilities.database.getQueryOptions(req)

  Model
    .find(queryOptions.where)
    .exec(function (err, documents) {
      if (err) {
        console.error(`Error in GET: `, err)

        req.res = {
          status: 500,
          message: `Could not get documents.`,
          data: []
        }
      } else {
        let count = documents.length
        let units = count === 1 ? 'document' : 'documents'

        req.res = {
          status: 200,
          message: `Found ${count} ${units}.`,
          data: documents
        }
      }

      next()
    })
}
