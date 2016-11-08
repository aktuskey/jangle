module.exports = function(req, res){

  const query = req.query;
  const user = query.user;
  const pass = query.pass;

  if(user === undefined || pass === undefined)
  {
    res.status(401).send({
      token: null,
      error: 'Please provide both a username and password.'
    });
  }
  else
  {
    requestToken(user, pass, function(token){

      if(token)
        res.status(200).send({ token: token });
      else
        res.status(403).send({
          token: token,
          error: 'Invalid username or password.'
        });

    });
  }

};


const requestToken = function(user, pass, callback){

  const mongodb = require('mongodb');
  const connectionInfo = include('connectionInfo.js');

  mongodb.MongoClient.connect(
    connectionInfo.getUrl(user,pass),
    function(err,db){

      if(err)
        callback(null);
      else
        getNewTokenFor(user, pass, callback);

    }
  );

};

const getNewTokenFor = (user, pass, callback) => {

  const jwt = global.jwt;
  const payload = {
    user: user,
    pass: pass
  }
  const secret = global.secret;
  const options = {
    expiresIn: '24h'
  };

  callback(jwt.sign(payload,secret,options));

};
