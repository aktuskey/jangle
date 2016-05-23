var mongoose = require('mongoose');

module.exports = function(router) {

    router.route('/user')

        .get(function(req, res){
            res.json('user api')
        })

};