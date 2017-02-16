var _Promise = global.Promise;

_Promise.prototype.success = function(onSuccess) {

	return this.then(

		onSuccess,

		function(reason) {

			return Promise.reject(reason);

		}

	);

};

module.exports = _Promise;
