module.exports = function(req, res, next) {

    let metaCollectionName = req.params.metaCollectionName

    req.url = `/collections/jangle.${metaCollectionName}`

    next()

}
