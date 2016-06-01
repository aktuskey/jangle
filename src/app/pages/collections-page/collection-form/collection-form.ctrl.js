module.exports = ['CollectionService', function(CollectionService){
   
    var ctrl = this;

    ctrl.collectionServiceData = CollectionService.data;
    ctrl.isLoading = false;

    ctrl.onAddCollection = function(){
        submitHelper('isAdding', 'addCollection');
    };

    ctrl.onEditCollection = function(){
        submitHelper('isEditing', 'editCollection');
    };

    ctrl.onRemoveCollection = function(){
        submitHelper('isRemoving', 'removeCollection');
    };

    var submitHelper = function(isLoading, serviceFunction) {

        ctrl[isLoading] = true;

        CollectionService[serviceFunction]().then(function(res){
            
            if(ctrl.onSuccess) 
                ctrl.onSuccess();

            ctrl[isLoading] = false;
            CollectionService.getAllCollections();
        });

    };

}];