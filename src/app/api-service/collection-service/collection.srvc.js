module.exports = ['ApiService', function(ApiService){

    var srvc = this;

    srvc.data = {
        collections: null
    };

    srvc.getAllCollections = function(){

        ApiService.get('collections',{}).then(function(res){
            console.log(res);
            srvc.data.collections = res.data;
        });

    };

}];