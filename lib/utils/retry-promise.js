'use strict'

/* -----------------------------------------------------------------------------
 * retryPromise
 * -------------------------------------------------------------------------- */

module.exports = function (fn, options) {
  return new Promise(function (resolve, reject) {
    let expired = false
    setTimeout(__ => (expired = true), options.retryTimeout)

    const retry = function () {
      fn().then(resolve).catch(err => {
        return expired ? reject(err) : setTimeout(retry, options.retryInterval)
      })
    }

    retry()
  })
}
