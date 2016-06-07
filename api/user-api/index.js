var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

module.exports = function(router, secret) {

    var hash = function(password){
        return crypto.createHash('sha256').update(password).digest('base64');
    };

    router.route('/user')

        .get(function(req, res){
            var params = req.query;

            var adminUser = {
                username: process.env.CMS_DB_USER,
                password: hash(process.env.CMS_DB_PWD)
            };

            var match = true;
            for(var i in adminUser)
            {
                if(params[i] != adminUser[i])
                    match = false;
            }

            if(match)
            {
                var user = {
                    username: params.username,
                    role: 'site-admin'
                };

                user.token = jwt.sign(user, secret, {
                    expiresIn: '24h'
                });

                res.status(200).json(user);
            }
            else res.status(400).json('Login failed');

        })

};