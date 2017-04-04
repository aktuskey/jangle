module.exports = function (config) {
  if (config.mongodb === undefined) {
    config.mongodb = {}
  }

  return {
    mongodb: {
      host: config.mongodb.host || 'mongo',
      port: config.mongodb.port || 27017,
      database: config.mongodb.database || 'jangle',
      metaPrefix: config.mongodb.metaPrefix || 'jangle.',
      auth: config.mongodb.auth || false,
      rootUser: config.mongodb.rootUser || 'admin',
      rootPassword: config.mongodb.rootPassword || 'password'
    }
  }
}
