const DISCONNECTED = 0,
    CONNECTED = 1;

module.exports = function (req, res) {

    // Close open connections
    if (req.connection && req.connection.readyState === CONNECTED) {

        req.connection.close();

    }

    // Set error
    var error = true;

    if (req.res.error !== undefined) {

        error = req.res.error;

    } else if (req.res.status !== undefined) {

        error = req.res.status >= 400;

    }

    res
        .status(req.res.status || 500)
        .json({
            message: req.res.message || '',
            error: error,
            data: req.res.data || []
        });

    if (req.done)
        req.done();

};