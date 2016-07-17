angular.module(module.exports='signUpForm', [])

    .component(module.exports, {
        templateUrl: 'templates/shared/sign-up-form/sign-up-form.html',
        controller: require('shared/sign-up-form/sign-up-form.ctrl'),
        bindings: {
        	onSubmit: '&'
        }
    })