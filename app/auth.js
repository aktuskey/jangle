module.exports = function(req, res){

  const query = req.query;
  const user = query.user;
  const pass = query.pass;

  if(user === undefined || pass === undefined)
  {
    res.status(401).send({ token: null });
  }
  else
  {
    getToken(user, pass, function(token){

      if(token)
        res.status(200).send({ token: token });
      else
        res.status(401).send({ token: token });

    });
  }
  
};


const getToken = function(user, pass, callback){

  const mongodb = require('mongodb');
  const connectionInfo = include('connectionInfo.js');

  mongodb.MongoClient.connect(
    connectionInfo.getUrl(user,pass),
    function(err,db){

      if(err)
        callback(null);
      else
        callback('n34no43oin2313414');

    }
  );

};
