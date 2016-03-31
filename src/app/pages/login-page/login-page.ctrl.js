module.exports = [function(){
  
    var ctrl = this;

    ctrl.showModal = false;

    ctrl.learnMoreClicked = function() {
        ctrl.showModal = true;
    };
  
}];