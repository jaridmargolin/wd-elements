'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party (rootmost - potentially a terrible idea)
const wd = require.main.require('selenium-webdriver')

// 3rd party
const _ = require('lodash')

// lib
const Primitives = require('./primitives')
const Finder = require('./finder')
const Driver = require('./driver')

/* -----------------------------------------------------------------------------
 * WDElements
 * -------------------------------------------------------------------------- */

// add all of our base internal primitives
const primitives = new Primitives()
primitives.load('./primitives')

Finder.lookupUsing(primitives)

// Return proxy of WDElemts that implements a dynamic getter to return
// an interface to interact with primitives
module.exports = new Proxy(function (_driver, DriverClass = Driver) {
  const isWrapper = _driver instanceof DriverClass
  const isSupported = _driver instanceof wd.WebDriver || isWrapper

  if (!isSupported) {
    throw new Error(`The specified driver is using an unsupported "selenium-webdriver" version.`)
  }

  // protect against wrapping driver multiple times
  const driver = isWrapper ? _driver : new DriverClass(_driver)

  Finder.createUsing(driver)
  return driver
}, {
  get: function (target, name) {
    if (_.isUndefined(primitives[name])) {
      return primitives.get(name)
    }

    return _.isFunction(primitives[name])
      ? primitives[name].bind(primitives)
      : primitives[name]
  }
})
