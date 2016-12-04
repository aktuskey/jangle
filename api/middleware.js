module.exports = function(req, res, next) {

    console.log(`API middleware hit for ${req.method} ${req.originalUrl}`);

    next();

};