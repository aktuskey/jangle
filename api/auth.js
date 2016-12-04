module.exports = function(req, res) {

    res.status(200).json({
        message: `Here's your token!`,
        error: false,
        data: [{token: '1234'}]
    });

};