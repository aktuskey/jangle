module.exports = ['CollectionService', function(CollectionService){
  
    var ctrl = this;

    ctrl.collectionServiceData = CollectionService.data;

    ctrl.onInit = function(){

        CollectionService.getAllCollections();

    };
  
}];