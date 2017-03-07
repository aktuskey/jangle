module.exports = {

    handleRejection: function(req, res, done) {

        return function (reason) {

            console.error(reason)

            req.res.message = reason

            done(req, res)
            
        }

    }


}
