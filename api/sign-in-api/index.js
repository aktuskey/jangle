var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var User = require('../user-api/model');

module.exports = function(router, secret) {

    var hash = function(password){
        return crypto.createHash('sha256').update(password).digest('base64');
    };

    router.route('/sign-in')

        .get(function(req, res){
            var params = req.query;

            var adminUser = {
                username: process.env.CMS_DB_USER,
                password: hash(process.env.CMS_DB_PWD)
            };

            var isAdmin = true;
            for(var i in adminUser)
            {
                if(params[i] != adminUser[i])
                    isAdmin = false;
            }

            // Check if user signed in as admin
            if(isAdmin)
            {
                var user = {
                    username: params.username,
                    role: 'site-admin'
                };

                user.token = jwt.sign(user, secret, {
                    expiresIn: '24h'
                });

                return res.status(200).json(user);
            }
            // Check if user is registered in user collection
            else 
            {
                User.findOne({
                    username: params.username,
                    password: params.password
                }, function(err,user){
                    if(err)
                        return res.status(400).json('Login failed');
                    else
                    {
                        var newUser = {
                            username: user.username,
                            role: user.role
                        };

                        newUser.token = jwt.sign(newUser, secret, {
                            expiresIn: '24h'
                        });

                        return res.status(200).json(newUser);
                    }
                });

            }


        })

};