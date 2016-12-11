module.exports = function(req, res, next) {

    req.res.message = `Here's your token!`;
    req.res.data = [{token: '1234'}];

    next();

};