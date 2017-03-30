module.exports = function (req, res) {
  let CONNECTED = 1

  if (req.connection && req.connection.readyState === CONNECTED) {
    req.connection.close()
  }

  req.res = req.res || {}

  let status = req.res.status || 500
  let message = req.res.message || ''
  let data = req.res.data || []
  let error = (req.res.error === undefined)
    ? status >= 400
    : req.res.error

  console.info(`...\t` + message + '\n')

  res.status(status).json({ message, error, data })
}
