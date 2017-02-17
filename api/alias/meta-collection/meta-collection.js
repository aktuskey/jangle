module.exports = function(req, res, next) {

    let metaCollectionName = req.params.metaCollectionName

    req.url = `/api/collections/jangle.${metaCollectionName}`

    next()

}
