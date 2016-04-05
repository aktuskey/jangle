module.exports = [function(){

    var ctrl = this;

    ctrl.close = function(){
        console.log('closing modal');

        if(ctrl.onClose)
            ctrl.onClose();
        
        ctrl.ngShow = false;
    };

    ctrl.submit = function(){
        console.log('submitting modal');
        ctrl.onSubmit();
        ctrl.ngShow = false;
    }

}];