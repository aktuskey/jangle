module.exports = function(req, res) {
  const method = req.method;

  switch (method) {
    case 'GET':
      return get(req, res);
    case 'POST':
      return post(req, res);
    case 'PUT':
      return put(req, res);
    case 'DELETE':
      return del(req, res);
    default:
      res.status(400).json({
        error: `${method} method not supported`
      });
  }
};

const get = (req, res) => {

  const userObject = req.userObject;

  res.status(200).send('get collections!');

};

const post = (req, res) => {

  const userObject = req.userObject;

  res.status(201).send('post collections!');

};

const put = (req, res) => {

  const userObject = req.userObject;

  res.status(200).send('put collections!');

};

const del = (req, res) => {

  const userObject = req.userObject;

  res.status(200).send('delete collections!');

};
