'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const _ = require('lodash')

// lib
const El = require('./el')

/* -----------------------------------------------------------------------------
 * El
 * -------------------------------------------------------------------------- */

module.exports = class Page extends El {

  static create (driver) {
    return driver.findElement({ css: 'html' })
      .then((el) => new this(el))
  }

  static matches (el) {
    return el.getTagName()
      .then((tagName) => tagName === 'html')
  }

  /* ---------------------------------------------------------------------------
   * getters
   * ------------------------------------------------------------------------ */

  getCurrentUrl () {
    return this.driver.getCurrentUrl()
  }

  getTitle () {
    return this.driver.getTitle()
  }

  getSource () {
    return this.driver.getPageSource()
  }

  /* ---------------------------------------------------------------------------
   * actions
   * ------------------------------------------------------------------------ */

  navigateTo (url) {
    return this.driver.get.apply(this.driver, arguments)
  }

  refresh () {
    return this.driver.navigate().refresh()
  }

  executeAsyncScript () {
    return this.driver.executeAsyncScript.apply(this.driver, arguments)
  }

  executeScript () {
    return this.driver.executeScript.apply(this.driver, arguments)
  }

  close () {
    return this.driver.close.apply(this.driver, arguments)
  }

  /* ---------------------------------------------------------------------------
   * wait
   * ------------------------------------------------------------------------ */

  waitUntilAbleToSwitchToFrame (frame) {
    if (_.isString(frame)) {
      frame = { css: frame }
    }

    return this._waitUntil('ableToSwitchToFrame', frame)
  }

  waitUntilAlertIsPresent () {
    return this._waitUntil('alertIsPresent')
  }

  waitUntilTitleContains (substr) {
    return this._waitUntil('titleContains', substr)
  }

  waitUntilTitleIs (title) {
    return this._waitUntil('titleIs', title)
  }

  waitUntilTitleMatches (regex) {
    return this._waitUntil('titleMatches', regex)
  }

  waitUntilUrlContains (substr) {
    return this._waitUntil('urlContains', substr)
  }

  waitUntilUrlIs (url) {
    return this._waitUntil('urlIs', url)
  }

  waitUntilUrlMatches (regex) {
    return this._waitUntil('urlMatches', regex)
  }

}
