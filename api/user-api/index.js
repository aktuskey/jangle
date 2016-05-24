var mongoose = require('mongoose');
var crypto = require('crypto');

module.exports = function(router) {

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
                res.status(200).json({
                    username: params.username,
                    role: 'site-admin'
                });                
            }
            else res.status(400).json('Login failed');

        })

};