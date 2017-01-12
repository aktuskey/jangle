var path = require('path');

module.exports = function (req, res) {

	res.status(200).sendFile(
		path.join(__dirname + '/index.html')
	);

};