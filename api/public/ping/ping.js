module.exports = function (req, res, next) {
  req.res = {
    status: 200,
    message: 'Connection successful.',
    data: []
  }

  next()
}
