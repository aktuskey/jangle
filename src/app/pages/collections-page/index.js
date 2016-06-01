require('angular').module(module.exports="collectionsPage", [
    require('shared/navbar'),
    require('shared/modal'),
    require('pages/collections-page/collection-form')
])
    .component('collectionsPage', {
        templateUrl: 'templates/pages/collections-page/collections-page.html',
        controller: require('pages/collections-page/collections-page.ctrl')
    })
