require('angular').module(module.exports='modal', [])

    .component('modal', {
        templateUrl: 'templates/shared/modal/modal.html',
        controller: require('shared/modal/modal.ctrl'),
        transclude: true,
        bindings: {
            title: '@',
            onSubmit: '&',
            ngShow: '='
        }
    })