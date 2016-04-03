describe("navbar", function() {

  // Load module
  beforeEach(angular.mock.module(require('navbar')));

  // Load templates for module
  beforeEach(angular.mock.module('templates/navbar/navbar.html'));

  var compile, rootScope;

  beforeEach(inject(function($compile, $rootScope){
    compile = $compile;
    rootScope = $rootScope;
  }));

  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });

  it("has title 'MongoCMS'", function() {
    var element = compile('<navbar></navbar>')(rootScope);
    rootScope.$digest();

    expect(element.html()).toContain('MongoCMS');
  });
});