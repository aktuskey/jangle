var config = require('./jangle-config.js')

if (config.mongodb === undefined) {

	config.mongodb = {}

}

module.exports = {

	mongodb: {
		host: config.mongodb.host || 'localhost',
		port: config.mongodb.port || 27017,
		database: config.mongodb.database || 'jangle',
		auth: config.mongodb.auth || false,
		rootUser: config.mongodb.rootUser || 'admin',
		rootPassword: config.mongodb.rootPassword || 'password'
	}

}
