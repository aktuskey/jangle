require('angular').module(module.exports="collectionsPage", [
    require('shared/navbar'),
    require('pages/collections-page/side-nav')
])
    .component('collectionsPage', {
        templateUrl: 'templates/pages/collections-page/collections-page.html',
        controller: require('pages/collections-page/collections-page.ctrl')
    })
