var User = require('./model.js');
var jwt = require('jsonwebtoken');

module.exports = function(mongoose, router) {

    router.route('/user')

        .get(function(req, res){
            
            // Only allow results if user has sufficient permission
            // if(req.role != 'site-admin')
            //     return res.status(403).json('Insufficient privileges');

            // Return documents in cms.collections collection
            var token = req.query.token;

            jwt.verify(token, req.secret, function(err, authenticatedUser){

                if(err)
                    return res.status(403).json('Failed to authenticate token.');
                else
                    return res.status(200).json(authenticatedUser);

            });

        })

        // .post(function(req, res){

        //     var newCollection = req.query;

        //     // Create document in cms.collections
        //     mongoose.connection.db.createCollection(newCollection.name, function(err, collection){

        //         if(err)
        //             res.status(500).json(err);
        //         else
        //         {
        //             // Create actual collection in database
        //             Collection.create(newCollection, function(err2, doc){
        //                 if(err2)
        //                     res.status(500).json(err2);
        //                 else
        //                     res.status(200).json(doc);
        //             });
        //         }

        //     });


        // })

        // .put(function(req, res){

        //     var newCollection = req.query;

        //     // Create actual collection in database
        //     Collection.update({name: newCollection.name}, newCollection, function(err, doc){
        //         if(err)
        //             res.status(500).json(err);
        //         else
        //             res.status(200).json(doc);
        //     });

        // })


        // .delete(function(req, res){

        //     var newCollection = req.query;

        //     // Create document in cms.collections
        //     mongoose.connection.db.dropCollection(newCollection.name, function(err, collection){

        //         if(err)
        //             res.status(500).json(err);
        //         else
        //         {
        //             // Create actual collection in database
        //             Collection.remove({name: newCollection.name}, function(err2, doc){
        //                 if(err2)
        //                     res.status(500).json(err2);
        //                 else
        //                     res.status(200).json(doc);
        //             });
        //         }

        //     });

        // })

};