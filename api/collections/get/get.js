module.exports = function(req, res, next) {

    let model = req.model,
        queryOptions = req.utilities.database.getFilterOptions(req),
        collectionName = req.params.collectionName

    if (model !== undefined) {

        console.log(queryOptions)

        let Model = req.connection.model(
            model.modelName,
            model.schema
        )

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

    } else {

        req.res = {
            status: 404,
            message: `Could not find collection '${collectionName}'`,
            data: []
        }

        next()

    }


}
