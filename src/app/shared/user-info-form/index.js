require('angular').module(module.exports='userInfoForm', [])

    .component('userInfoForm', {
        templateUrl: 'templates/shared/user-info-form/user-info-form.html',
        controller: require('shared/user-info-form/user-info-form.ctrl'),
        bindings: {
        	onSubmit: '&'
        }
    })