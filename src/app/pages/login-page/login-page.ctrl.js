module.exports = [function(){
  
    var ctrl = this;

    ctrl.showSimpleModal = false;
    ctrl.showButtonModal = false;

    ctrl.learnMoreClicked = function() {
        ctrl.showModal = true;
    };
  
}];