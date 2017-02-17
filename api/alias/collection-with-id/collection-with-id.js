module.exports = function(req, res, next) {

    let collectionName = req.params.collectionName,
        collectionId = req.params.id

    // TODO: Test that we maintain all of the query parameters
    req.query = req.query || {}

    req.query['where'] = `{"jangle.id": "${collectionId}" }`

    req.url = `/api/collections/${collectionName}`

    next()

}
