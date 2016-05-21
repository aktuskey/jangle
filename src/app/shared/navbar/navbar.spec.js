describe("navbar", function() {

  var element, ctrl;

  beforeEach(function(){

    // Load module
    angular.mock.module(require('navbar'))

    // Mock services
    angular.mock.module(function ($provide) {
      $provide.value('UserDataService', {});
    });

    // Load templates
    angular.mock.module('templates/navbar/navbar.html');

    // Initialize component
    var $compile, $rootScope, $componentController;
    inject(function(_$compile_, _$rootScope_, _$componentController_){
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $componentController = _$componentController_;
    });

    // Initialize template
    element = $compile('<navbar></navbar>')($rootScope);
    $rootScope.$digest();

    // Initialize controller
    ctrl = $componentController('navbar', {})

  });


  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });

  it("has title 'MongoCMS'", function() {
    expect(element.html()).toContain(ctrl.title);
  });
});