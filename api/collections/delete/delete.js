module.exports = function(req, res, next) {

    let Model = req.Model,
        queryOptions = req.utilities.database.getQueryOptions(req)

    Model.remove(queryOptions.where)
        .remove(function(err, writeOpResult) {

            if (err) {

                console.error(err)

                req.res = {
                    status: 400,
                    message: 'Error deleting documents.',
                    data: []
                }

            } else {

                let count = writeOpResult.result.n,
                    units = count === 1 ? 'document' : 'documents'

                req.res = {
                    status: 200,
                    message: `Removed ${count} ${units}.`,
                    data: []
                }

            }

            next()

        })

}
