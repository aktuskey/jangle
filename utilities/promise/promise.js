module.exports = function (basePromise) {
  var _Promise = basePromise

  _Promise.prototype.success = function (onSuccess) {
    return this.then(
      onSuccess,
      function (reason) {
        return basePromise.reject(reason)
      }
    )
  }

  return _Promise
}
