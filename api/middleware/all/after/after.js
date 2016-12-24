const
  DISCONNECTED = 0,
  CONNECTED = 1;

module.exports = function (req, res) {

  // Close open connections
  if (req.connection.readyState === CONNECTED) {
    req.connection.close();
  }

  res.status(req.res.status || 500).json({
    message: req.res.message || '',
    error: req.res.error || req.res.status ? req.res.status >= 400 : true,
    data: req.res.data || []
  });

};