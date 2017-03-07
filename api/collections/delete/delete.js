module.exports = function(req, res, next) {

    let Model = req.Model,
        filterOptions = req.utilities.database.getFilterOptions(req)

    Model.remove(filterOptions.where)
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
