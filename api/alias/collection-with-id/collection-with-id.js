module.exports = function (req, res, next) {
  let collectionName = req.params.collectionName
  let collectionId = req.params.id

  // TODO: Test that we maintain all of the query parameters
  req.query = req.query || {}

  req.query['where'] = `{"jangle.id": "${collectionId}" }`

  req.url = `/collections/${collectionName}`

  next()
}
