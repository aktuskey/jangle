describe('Login page', function() {

    beforeEach(function() {
        browser.get('http://localhost:8080/login');
    });

    it('should have a title', function() {

        expect(browser.getTitle()).toEqual('MongoCMS');

    });

    it('should display error on failure', function() {

        // Get input fields
        var usernameInput = element(by.model('$ctrl.username'));
        var passwordInput = element(by.model('$ctrl.password'));

        // Enter invalid credentials
        usernameInput.sendKeys('cms-admin');
        passwordInput.sendKeys('test-garbage');

        // Click submit button
        element(by.deepCss('button[ng-click="$ctrl.onSignIn()"]')).click();

        // Wait a bit
        browser.sleep(1000);

        // Check css class on inputs
        expect(usernameInput.getAttribute('class')).toContain('is-danger');
        expect(passwordInput.getAttribute('class')).toContain('is-danger');

    });

});