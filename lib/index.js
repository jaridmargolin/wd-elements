'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const _ = require('lodash')

// lib
const Primitives = require('./primitives')
const El = require('./primitives/el')

/* -----------------------------------------------------------------------------
 * WDElements
 * -------------------------------------------------------------------------- */

// add all of our base internal primitives
const primitives = new Primitives()

// config method - lets you set the webdriver module to use - If not specified,
// will utilize module version packaged with WDElement (using mismatched
// versions may have undesired side effects). Setting the driver is recommended
module.exports = function (wd) {
  El.configure(wd || require('selenium-webdriver'), primitives)
  primitives.load('./primitives')

  // Return proxy of WDElemts that implements a dynamic getter to return
  // an interface to interact with primitives
  return new Proxy({}, {
    get: function (target, name) {
      if (_.isUndefined(primitives[name])) {
        return primitives.get(name)
      }

      return _.isFunction(primitives[name])
        ? primitives[name].bind(primitives)
        : primitives[name]
    }
  })
}
