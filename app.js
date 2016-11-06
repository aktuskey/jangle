global.include = (file) => { return require(__dirname + '/' + file); };

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

  app.get('/', require('./app/index.js'));
  app.get('/auth', require('./app/auth.js'));
  app.get('/api', require('./app/api.js'));

  app.listen(3000, function(){
    console.log('API available at http://localhost:3000');
  });

});
