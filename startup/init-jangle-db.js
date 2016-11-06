module.exports = function(mongodb, onComplete){

  const MongoClient = mongodb.MongoClient;

  const connectionInfo = include('connectionInfo.js');

  MongoClient.connect(connectionInfo.getAdminUrl(), function(err, db){

    if(err)
      console.error(`Could not access '${connectionInfo.database}' database with user '${connectionInfo.user}'.`)
    else
      updateJangleCollections(db, onComplete);

  });
};

const updateJangleCollections = function(db, onComplete){

  const collections = [
    'content.collection', // holds collection data
    'content.field', // defined types of input
    'content.section' // collection groups
  ];

  var collectionsToUpdate = collections.length;

  const collectionAdded = () => {
    collectionsToUpdate -= 1;
    if(collectionsToUpdate == 0)
      doneUpdatingCollections(db, onComplete);
  };

  console.log(`Updating ${collectionsToUpdate} jangle collections:`);

  collections.map((x) => updateJangleCollection(db, collectionAdded, x));


};

const updateJangleCollection = function(db, callback, collectionNameSuffix) {

  const dbPrefix = 'jangle.';
  const collectionModel = getModelFromCollectionName(collectionNameSuffix);
  const collectionName = dbPrefix + collectionNameSuffix;

  const options = {
    validator: collectionModel.validator,
    validationLevel: 'strict'
  };

  db.createCollection(collectionName, options, (err, results) => {
    if(err)
      console.log(err);
    else
    {
      console.log(`  ${results.s.name}`);

      if(collectionModel.uniqueIndexes)
      {
        db.collection(collectionName).createIndex(
          collectionModel.uniqueIndexes,
          { unique: true }
        );
      }

      updateInitialDocuments(db, callback, collectionName, collectionModel);
    }
  });

};

const updateInitialDocuments = function(db, callback, collectionName, collectionModel){

  const initialValues = collectionModel.getInitialValues();
  const uniqueIndexes = collectionModel.uniqueIndexes || {};

  var docsToUpdate = initialValues.length;

  if(docsToUpdate === 0)
  {
    callback();
  }
  else
  {
    const documentUpdated = () => {
      docsToUpdate -= 1;
      if(docsToUpdate === 0)
        callback();
    };

    initialValues.map((value) =>
      updateDocument(db, documentUpdated, collectionName, uniqueIndexes, value)
    );
  }

};

const updateDocument = (db, callback, collectionName, uniqueIndexes, value) => {

  const query = {};
  const update = value;
  const options = {
    upsert: true
  };

  // build a query of unique indices to uniquely id the document
  for(var field in uniqueIndexes)
  {
    query[field] = value[field];
  }

  db.collection(collectionName).updateOne(
    query,
    update,
    options,
    (err, results) => {
      if(err)
      {
        console.log(`  ${collectionName} ${err.message.toLowerCase()}:`);
        console.log(`  |-->  ${JSON.stringify(value)}`);
      }

      callback();
    }
  );

};

const getModelFromCollectionName = function(collectionName) {

  const basePath = '../collections';
  const separatedWords = collectionName.split('.');
  const joinedPath = separatedWords.join('/');
  const totalPath = basePath + '/' + joinedPath + '.js';

  try {
    return require(totalPath);
  }
  catch (err){
    console.error(`Warning: No collection model found for '${collectionName}'.`);
    return {};
  }

};

const doneUpdatingCollections = function(db, onComplete){
  console.log('Done updating collections!');
  onComplete(db);
}
