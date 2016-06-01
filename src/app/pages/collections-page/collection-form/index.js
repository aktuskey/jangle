require('angular').module(module.exports="collectionForm", [])
    .component(module.exports, {
        templateUrl: 'templates/pages/collections-page/collection-form/collection-form.html',
        controller: require('./collection-form.ctrl'),
        bindings: {
            onSuccess: '&'
        }
    })
