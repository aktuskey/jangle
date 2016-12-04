module.exports = function(req, res) {

    res.status(200).json({
        message: 'Connection successful.',
        error: false,
        data: []
    });

};