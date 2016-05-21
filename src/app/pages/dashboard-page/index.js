require('angular').module(module.exports="dashboardPage", [
    require('shared/navbar'),
    require('pages/dashboard-page/side-nav')
])
    .component('dashboardPage', {
        templateUrl: 'templates/pages/dashboard-page/dashboard-page.html',
        controller: require('pages/dashboard-page/dashboard-page.ctrl'),
        bindings: {
            title: '@'
        }
    })
