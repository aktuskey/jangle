var express = require('express');
var app = express();
var router = express.Router();
var dotenv = require('dotenv');

// Load environment variables from .env file
if(process.env.NODE_ENV != 'production')
  dotenv.load();

// Static Files
app.use('/static', express.static('dist/static'));
app.use('/node_modules', express.static('node_modules'));
app.use('/templates', express.static('dist/app'));

// API
var api = require('./api')(router);
app.use('/api', router);

// Web Application
app.use(function(req, res) {
  console.log(req.url);
  if(req.url.substr(0,'/templates'.length) == '/templates')
  	res.status(500);
  else
  	res.status(200).sendFile(__dirname+'/dist/index.html');
});

console.log('Listening on port 8080...')
app.listen(8080);
