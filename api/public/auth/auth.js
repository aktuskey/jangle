module.exports = function (req, res, next) {
  let username = req.query.username || req.body.username
  let password = req.query.password || req.body.password
  let ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
  let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password'
  let ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'token'

  if (username === undefined || password === undefined) {
    req.res = {
      status: 400,
      message: 'Please provide username and password.',
      data: []
    }
  } else if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.res = {
      status: 200,
      message: 'Authentication successful!',
      data: [{
        token: ADMIN_TOKEN
      }]
    }
  } else {
    req.res = {
      status: 400,
      message: 'Authentication failed.',
      data: []
    }
  }

  next()
}
