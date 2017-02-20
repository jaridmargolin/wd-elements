/* global browser */
'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
const WDE = require('../../../lib/index')

/* -----------------------------------------------------------------------------
 * configure
 * -------------------------------------------------------------------------- */

browser.wrapBuildFn = function () {
  browser._originalBuildFn = browser.build
  browser.build = function () {
    return WDE(browser._originalBuildFn(browser))
  }

  return browser.driver.quit()
}

browser.unwrapBuildFn = function () {
  browser.build = browser._originalBuildFn
  return browser.driver.quit()
}

/* -----------------------------------------------------------------------------
 * expose
 * -------------------------------------------------------------------------- */

module.exports = browser
