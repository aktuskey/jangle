angular.module(module.exports='modal', [])

    .component(module.exports, {
        templateUrl: 'templates/shared/modal/modal.html',
        controller: require('shared/modal/modal.ctrl'),
        transclude: true,
        bindings: {
            title: '@',
            onClose: '&',
            onSubmit: '&',
            showModal: '='
        }
    })