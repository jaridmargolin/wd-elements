'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const wd = require('selenium-webdriver')

// lib
const Finder = require('./finder')

/* -----------------------------------------------------------------------------
 * private
 * -------------------------------------------------------------------------- */

const elementWaitMethods = new Set([
  'elementIsEnabled',
  'elementIsDisabled',
  'elementIsSelected',
  'elementIsNotSelected',
  'elementIsVisible',
  'elementIsNotVisible',
  'stalenessOf',
  'elementTextContains',
  'elementTextIs',
  'elementTextMatches',
  'elementLocated'
])

/* -----------------------------------------------------------------------------
 * El
 * -------------------------------------------------------------------------- */

module.exports = class Driver extends Finder {

  get elementWaitMethods () {
    return elementWaitMethods
  }

  constructor (driver) {
    super(driver)
    this._driver = driver

    return this.proxyTo('_driver')
  }

  /* ---------------------------------------------------------------------------
   * actions
   * ------------------------------------------------------------------------ */

  refresh () {
    return this._driver.navigate().refresh()
  }

  /* ---------------------------------------------------------------------------
   * wait
   * ------------------------------------------------------------------------ */

  wait () {
    return this._driver.wait.apply(this._driver, arguments).then((result) => {
      return result instanceof wd.WebElement
        ? this._createFromEl(result)
        : result
    })
  }

  waitUntil (name, ...args) {
    // if a wd el is passed -> parse it into a raw WebElement
    if (args[0] && args[0]._el) {
      args[0] = args[0]._el
    }

    if (!this.elementWaitMethods.has(name) || args[0] instanceof wd.WebElement) {
      return this.wait(wd.until[name](...args))
    }

    return this.find(args[0])
      .then((el) => this.waitUntil(name, ...[el].concat(args.slice(1))))
  }

}
