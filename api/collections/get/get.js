module.exports = function(req, res, next) {

    let Model = req.Model,
        queryOptions = req.utilities.database.getFilterOptions(req)

    Model.find(queryOptions.where)
        .exec(function (err, documents) {

            if (err) {

                console.error(`Error in GET: `, err)

                req.res = {
                    status: 500,
                    message: `Could not get documents.`,
                    data: []
                }

            } else {

                let count = documents.length,
                    units = count === 1 ? 'document' : 'documents'

                req.res = {
                    status: 200,
                    message: `Found ${count} ${units}.`,
                    data: documents
                }

            }

            next()

        })



}
