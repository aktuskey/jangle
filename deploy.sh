#!/bin/bash

set -o errexit -o nounset

if [ "$TRAVIS_BRANCH" != "master" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master! No deploy!"
  exit 0
fi

rev=$(git rev-parse --short HEAD)

git init
git config user.name "Ryan Haskell-Glatz"
git config user.email "ryan.nhg@gmail.com"

git remote add upstream "https://$GH_TOKEN@github.com/ryannhg/mongo-cms.git"
git fetch upstream
git reset upstream/production

touch .

git add -A .
git commit -m "rebuild pages at ${rev}"
git push -q upstream HEAD:production
