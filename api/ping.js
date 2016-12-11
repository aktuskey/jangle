module.exports = function(req, res, next) {

    req.res.message = 'Connection successful.';

    next();
};