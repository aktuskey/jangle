module.exports = function(req, res){

  const query = req.query;
  const token = query.token;
  const jwt = global.jwt;
  const secret = global.secret;

  if(token === undefined)
  {
    res.status(401).json({
      data: [],
      error: 'No token provided.'
    });
  }
  else
  {
    jwt.verify(token, secret, function(err, userObject){

      if(err)
      {
        res.status(403).json({
          data: [],
          error: 'Token invalid.'
        });
      }
      else
      {
        req.userObject = userObject;

        // TODO: Continue with 'req.userObject' to authenticate request
        res.status(200).json({
          user: userObject.user
        });
      }

    });
  }

};
