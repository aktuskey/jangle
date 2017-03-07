module.exports = function(req, res, next) {

    let Model = req.Model,
        documents = req.query.documents,
        newDocuments = undefined,
        parseError = false

    try {

        newDocuments = JSON.parse(documents)

    } catch (ignore) {

        parseError = true

    }

    if (newDocuments !== undefined && newDocuments.length > 0) {

        let count = newDocuments.length,
            units = count === 1 ? 'document' : 'documents'

        Model.create(newDocuments, function(err, documents) {

            if(err) {

                var getCreateErrorMessage =
                    req.utilities.database.getCreateErrorMessage

                req.res = {
                    status: 400,
                    message: getCreateErrorMessage(err),
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
