module.exports = function(api, router) {

    // Alias API
    router.route('/jangle/:metaCollectionName')
        .all(api.alias.metaCollection)

    router.route('/jangle/:metaCollectionName/:id')
        .all(api.alias.metaCollectionWithId)

    router.route('/collections/:collectionName/:id')
        .all(api.alias.collectionWithId)


    // Public API
    router.route('/ping')
        .get(api.public.ping)

    router.route('/auth')
        .get(api.public.auth)


    // Collections API
    router.route('/collections/:collectionName')
        .all(api.collections.before(api.after))
        .get(api.collections.get)
        .post(api.collections.post)
        .put(api.collections.put)
        .delete(api.collections.delete)


    router.all(api.after)

    return router

}
