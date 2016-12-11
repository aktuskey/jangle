const DISCONNECTED = 0, CONNECTED = 1;

module.exports = function(req, res) {

    // Close open connections
    if(req.connection.readyState == CONNECTED)
        req.connection.close();

    res.status(req.res.status).json(req.res);

};