var Collection = require('./model.js');

module.exports = function(mongoose, router) {

    router.route('/collections')

        .get(function(req, res){
            
            if(req.authenticatedUser.role != 'site-admin')
                return res.status(403).json('Insufficient privileges');

            if(req.query.all !== undefined)
            {
                // Return array of all collections in database
                mongoose.connection.db.listCollections().toArray(function(err, collections) {
                    if(err)
                        res.status(500).json(err);
                    else
                        res.status(200).json(collections);
                });
            }
            else if(req.query.name)
            {
                // Return document specified by name
                Collection.findOne({name: req.query.name}, function(err, doc){
                    if(err)
                        res.status(500).json(err);
                    else
                        res.status(200).json(doc);
                });
            }
            else
            {
                // Return documents in cms.collections collection
                Collection.find(function(err, docs){
                    if(err)
                        res.status(500).json(err);
                    else
                        res.status(200).json(docs);
                });
            }

        })

        .post(function(req, res){

            var newCollection = req.query;

            // Create document in cms.collections
            mongoose.connection.db.createCollection(newCollection.name, function(err, collection){

                if(err)
                    res.status(500).json(err);
                else
                {
                    // Create actual collection in database
                    Collection.create(newCollection, function(err2, doc){
                        if(err2)
                            res.status(500).json(err2);
                        else
                            res.status(200).json(doc);
                    });
                }

            });


        })

        .put(function(req, res){

            var newCollection = req.query;

            // Create actual collection in database
            Collection.update({name: newCollection.name}, newCollection, function(err, doc){
                if(err)
                    res.status(500).json(err);
                else
                    res.status(200).json(doc);
            });

        })


        .delete(function(req, res){

            var newCollection = req.query;

            // Create document in cms.collections
            mongoose.connection.db.dropCollection(newCollection.name, function(err, collection){

                if(err)
                    res.status(500).json(err);
                else
                {
                    // Create actual collection in database
                    Collection.remove({name: newCollection.name}, function(err2, doc){
                        if(err2)
                            res.status(500).json(err2);
                        else
                            res.status(200).json(doc);
                    });
                }

            });

        })

};