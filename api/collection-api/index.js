module.exports = function(mongoose, router) {

    router.route('/collections')

        .get(function(req, res){
            mongoose.connection.db.listCollections().toArray(function(err, names) {
                res.status(200).json(names)
            });
        })

};