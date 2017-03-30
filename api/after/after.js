let CONNECTED = 1

module.exports = function (req, res) {
  // Close open connections
  if (req.connection && req.connection.readyState === CONNECTED) {
    req.connection.close()
  }
  req.res = req.res || {}

  let status = req.res.status || 500
  let message = req.res.message || ''
  let data = req.res.data || []
  let error = status >= 400

  console.info(`...\t` + message + '\n')

  res.status(status).json({ message, error, data })
}
