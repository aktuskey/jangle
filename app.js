// Step 1: Load any development environment variables
if(process.env.NODE_ENV != 'production')
{
  const dotenv = require('dotenv');
  dotenv.config({silent: true});
}

// Step 2: Return alert user if environment variables are missing
require('./startup/env-check.js');

// Step 3: Initialize jangle database
const mongodb = require('mongodb');
require('./startup/init-jangle-db')(mongodb);
