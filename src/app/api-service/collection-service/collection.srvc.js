module.exports = ['ApiService', function(ApiService){

    var srvc = this;

    srvc.data = {
        // List of all collections
        collections: null,
        // Current collection being created/edited/deleted
        collection: null,
        // States whether collection was last set or reset
        isNewCollection: true
    };

    // setCollection - makes a copy of the provided collection for use in forms
    srvc.setCollection = function(collection){

        srvc.data.collection = {};

        for(var i in collection)
            srvc.data.collection[i] = collection[i];

        srvc.data.isNewCollection = false;
        
    };

    // resetCollection - resets the collection object
    srvc.resetCollection = function(collection){

        srvc.data.collection = {};
        srvc.data.isNewCollection = true;
        
    };

    // getAllCollections - returns a list of all collections created by user
    srvc.getAllCollections = function(){

        return ApiService.get('collections',{}).then(function(res){
            srvc.data.collections = res.data;
            return res;
        });

    };

    // editCollection - edits an existing collection
    srvc.editCollection = function(){

        return ApiService.put('collections',{
            name: srvc.data.collection.name,
            description: srvc.data.collection.description
        });

    };

    // addCollection - adds a new collection
    srvc.addCollection = function(){

        return ApiService.post('collections', {
            name: srvc.data.collection.name,
            description: srvc.data.collection.description
        });
        
    };

    // removeCollection - removes an existing collection
    srvc.removeCollection = function(){

        return ApiService.delete('collections', {
            name: srvc.data.collection.name
        });

    };

}];