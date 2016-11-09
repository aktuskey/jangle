global.include = (file) => { return require(__dirname + '/' + file); };
global.jwt = require('jsonwebtoken');
global.secret = ''+parseInt(Math.random()*Number.MAX_SAFE_INTEGER);

// Step 1: Load any development environment variables
if(process.env.NODE_ENV != 'production')
{
  const dotenv = require('dotenv');
  dotenv.config({silent: true});
}

// Step 2: Aalert user if environment variables are missing
require('./startup/env-check.js');

// Step 3: Initialize jangle database
const mongodb = require('mongodb');
require('./startup/init-jangle-db')(mongodb, (db) => {

  // I have strong feels that I'm going
  // to use user connections to the mongo, not this
  // root admin one.
  db.close();

  // Step 4: Expose APIs to allow authorized access to content
  const express = require('express');
  const app = express();

  // Web UI
  app.get('/', require('./app/index.js'));
  app.get('/login', require('./app/index.js'));
  app.get('/app/*', require('./app/index.js'));

  // Auth endpoint
  app.use('/auth', require('./app/auth.js'));

  // All api requests
  app.use('/api/*', require('./app/api.js'));

  // Host on port 3000
  app.listen(3000, function(){
    console.log('Jangle available at http://localhost:3000');
  });

});
