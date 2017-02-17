module.exports = function(req, res, next) {

    let metaCollectionName = req.params.metaCollectionName,
        metaCollectionId = req.params.id,
        metaCollectionIdField = 'name'

    // TODO: Consolidate duplicate logic (see api.alias.collectionWithId)
    req.query = req.query || {}

    req.query['where'] = `{"${metaCollectionIdField}": "${metaCollectionId}" }`

    req.url = `/api/jangle/${metaCollectionName}`

    next()

}
