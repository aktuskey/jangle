module.exports = function (req, res, next) {
  let metaCollectionName = req.params.metaCollectionName
  let metaCollectionId = req.params.id
  let metaCollectionIdField = 'name'

  // TODO: Consolidate duplicate logic (see api.alias.collectionWithId)
  req.query = req.query || {}

  req.query['where'] = `{"${metaCollectionIdField}": "${metaCollectionId}" }`

  req.url = `/jangle/${metaCollectionName}`

  next()
}
