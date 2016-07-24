module.exports = ['$location', function($location){
  
    var ctrl = this;

    ctrl.onSignUp = function(){

        $location.path('jangle/collections');

    };

}];