module.exports = {
  host: process.env.JANGLE_HOST,
  user: process.env.JANGLE_USER,
  pass: process.env.JANGLE_PASS,
  database: 'jangle',
  port: 27017,
  authMechanism: 'DEFAULT',
  authDatabase: 'admin',
  getAdminUrl: function() {
    return this.getUrl(this.user, this.pass);
  },
  getUrl: function(user, pass){
      return 'mongodb://' +
        user + ':' + pass +
        '@' +
        this.host + ':' + this.port +
        '/' + this.database +
        '?authMechanism=' + this.authMechanism +
        '&authSource=' + this.authDatabase;
  }
};
