module.exports = [function(){

    var ctrl = this;

    ctrl.close = function(){
        console.log('closing modal');
        ctrl.ngShow = false;
    };

    ctrl.submit = function(){
        console.log('submitting modal');
        ctrl.ngShow = false;
    }

}];