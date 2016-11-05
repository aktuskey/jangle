module.exports = function(mongodb){

  const MongoClient = mongodb.MongoClient;

  const connectionInfo = {
    host: process.env.JANGLE_HOST,
    user: process.env.JANGLE_USER,
    pass: process.env.JANGLE_PASS,
    database: 'jangle',
    port: 27017,
    authMechanism: 'DEFAULT',
    authDatabase: 'admin',
    getUrl: function() {
      return 'mongodb://' +
        this.user + ':' + this.pass +
        '@' +
        this.host + ':' + this.port +
        '/' + this.database +
        '?authMechanism=' + this.authMechanism +
        '&authSource=' + this.authDatabase;
    }
  };

  MongoClient.connect(connectionInfo.getUrl(), function(err, db){

    if(err)
      console.error(`Could not access '${connectionInfo.database}' database with user '${connectionInfo.user}'.`)
    else
      updateJangleCollections(db);

  });
};

const updateJangleCollections = function(db){

  const collections = [
    'content.collection', // holds collection data
    'content.field', // defined types of input
    'content.section' // collection groups
  ];

  var collectionsToUpdate = collections.length;

  const collectionAdded = () => {
    collectionsToUpdate -= 1;
    if(collectionsToUpdate == 0)
      doneUpdatingCollections(db);
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

const doneUpdatingCollections = function(db){
  console.log('Done updating collections!');
  db.close();
}
