let DISCONNECTED = 0,
    CONNECTED = 1;

module.exports = function(req, res) {

    // Close open connections
    if (req.connection && req.connection.readyState === CONNECTED) {

        req.connection.close().then(() => {

            if (req.connection.readyState === DISCONNECTED) {

                console.info('Closed open connection.')

            }

        })

    }

    req.res = req.res || {}

    let status = req.res.status || 500,
        message = req.res.message || '',
        data = req.res.data || [],
        error = status >= 400

    res.status(status).json({ message, error, data })

};
