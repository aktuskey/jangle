module.exports = ['CollectionService', function(CollectionService){
  
    var ctrl = this;

    ctrl.collectionServiceData = CollectionService.data;
    ctrl.showEditModal = false;

    ctrl.getAllCollections = function(){

        CollectionService.getAllCollections();

    };

    ctrl.addNewCollection = function(){

        CollectionService.resetCollection();

        ctrl.showEditModal = true;

    };

    ctrl.editCollection = function(collection) {

        CollectionService.setCollection(collection);

        ctrl.showEditModal = true;

    };

    ctrl.editDocuments = function(collection) {

        // TODO: Allow document editing

    };
  
}];