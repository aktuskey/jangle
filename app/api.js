module.exports = function(req, res, next){

  const jwt = global.jwt;
  const secret = global.secret;
  const token = req.query.token || req.headers['x-access-token'];
  const mongodb = require('mongodb');
  const connectionInfo = include('connectionInfo.js');

  /*  STATUS CODE REF: http://www.restapitutorial.com/httpstatuscodes.html

      200 - OK
      201 - CREATED
      204 - NO CONTENT (to return)

      304 - NOT MODIFIED

      400 - BAD REQUEST
      401 - UNAUTHORIZED (didnt provide credentials)
      403 - FORBIDDEN (credentials insufficient)
      404 - NOT FOUND
      409 - CONFLICT (try again)

      500 - INTERNAL SERVER ERROR

  */

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
        mongodb.MongoClient.connect(
          connectionInfo.getUrl(userObject.user, userObject.pass),
          function(err, db){

            if(err)
            {
              res.status(403).json({
                data: [],
                error: `User '${userObject.user}' does not have access.`
              });
            }
            else
            {
              req.db = db;
              next();
            }

          }
        );
      }

    });
  }

};
