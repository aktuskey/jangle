#!/bin/bash

set -o errexit -o nounset

# if [ "$TRAVIS_BRANCH" != "master" ]
# then
#   echo "This commit was made against the $TRAVIS_BRANCH and not the master! No deploy!"
#   exit 0
# fi

# Generate dist folder if it has not been generated
if [ ! -d "dist" ]; then
  gulp
fi

# Set up local git user
# git config --global user.email "ryan.nhg@gmail.com"
# git config --global user.name "Ryan Haskell-Glatz"

# Clone the production branch into 'prod'
git clone -b production http://github.com/ryannhg/mongo-cms.git prod

# Delete all non-hidden files in prod folder
rm prod/* -r

# Copy all new files into the prod directory
cp dist package.json app.js api Procfile README.prod.md prod -r

# Enter the prod directory
cd prod

# Create README for production branch
mv README.prod.md README.md

# Add all changes, commit them, push them
git add --all
git commit -m "travis automated deploy"
git push origin production

# Remove the prod folder
rm prod -rf