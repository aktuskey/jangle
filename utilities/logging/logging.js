module.exports = {

    handleRejection: function(req, res, done) {

        return function (reason) {
            console.error(reason)
            done(req, res)
        }

    }


}
