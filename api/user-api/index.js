var User = require('./model.js');
var jwt = require('jsonwebtoken');

module.exports = function(mongoose, router) {

    router.route('/user')

        .get(function(req, res){

            // Return documents in cms.collections collection
            var token = req.query.token;

            jwt.verify(token, req.secret, function(err, authenticatedUser){

                if(err)
                    return res.status(403).json('Failed to authenticate token.');
                else
                    return res.status(200).json(authenticatedUser);

            });

        })

};