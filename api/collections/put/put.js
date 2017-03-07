module.exports = function(req, res, next) {

    let Model = req.Model,
        filterOptions = req.utilities.database.getFilterOptions(req),
        getDeltas = req.utilities.database.getDeltas

    Model.find(filterOptions.where).exec(function (err, documents) {

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

            let count = documents.length,
                units = count === 1 ? 'document' : 'documents',
                deltas = getDeltas(documents, filterOptions.set, filterOptions.unset),
                documentsProcessed = 0,
                documentsUpdated = 0,
                newDocuments = []

            documents.map( (document, index) => {

                // Update document version array
                document.jangle.previousVersions.push( deltas[index] )

                var updates = {}

                if(filterOptions.set !== undefined && Object.keys(filterOptions.set).length > 0)
                    updates.$set = filterOptions.set

                if(filterOptions.unset !== undefined && Object.keys(filterOptions.unset).length > 0)
                    updates.$unset = filterOptions.unset

                if(filterOptions.set && Object.keys(filterOptions.set).length > 0)
                    updates['jangle.previousVersions'] = document.jangle.previousVersions

                Model.update({ '_id': document._id }, updates, function (err, result) {

                    if (err) {

                        console.error(err)

                    } else {

                        documentsUpdated++

                    }

                    documentsProcessed++;

                    if(documentsProcessed === count) {

                        req.res = {
                            status: 200,
                            message: `Updated ${documentsUpdated} ${units}.`,
                            data: documents
                        }

                        next()

                    }


                })

            })

        }

    })

}
