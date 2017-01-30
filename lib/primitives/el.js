'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const _ = require('lodash')
const Promise = require('bluebird')
const wd = require('selenium-webdriver')
const retry = require('bluebird-retry')

// lib
const Finder = require('../finder')
const findClosestScript = require('../scripts/find-closest')

/* -----------------------------------------------------------------------------
 * private
 * -------------------------------------------------------------------------- */

const elementWaitAliases = {
  'isEnabled': 'elementIsEnabled',
  'isDisabled': 'elementIsDisabled',
  'isSelected': 'elementIsSelected',
  'isNotSelected': 'elementIsNotSelected',
  'isVisible': 'elementIsVisible',
  'isNotVisible': 'elementIsNotVisible',
  'isStale': 'stalenessOf',
  'textContains': 'elementTextContains',
  'textIs': 'elementTextIs',
  'textMatches': 'elementTextMatches'
}

/* -----------------------------------------------------------------------------
 * El
 * -------------------------------------------------------------------------- */

module.exports = class El extends Finder {

  static create (selector) {
    return this.driver.find(selector, { Class: this })
  }

  static matches (el) {
    return Promise.resolve(el instanceof wd.WebElement)
  }

  get properties () {
    return ['text']
  }

  get elementWaitAliases () {
    return elementWaitAliases
  }

  constructor (el) {
    super(el)
    this._el = el

    return this.proxyTo('_el')
  }

  getDriver () {
    return this.driver
  }

  /* ---------------------------------------------------------------------------
   * data
   * ------------------------------------------------------------------------ */

  data () {
    const props = arguments.length ? _.toArray(arguments) : this.properties

    return Promise.props(_.reduce(props, (props, prop) => {
      const parts = prop.split(':')
      const getter = this[`get${_.capitalize(parts[0])}`]
      const getterArgs = _.tail(parts)

      return _.set(props, prop, getter.apply(this, getterArgs))
    }, {}))
  }

  /* ---------------------------------------------------------------------------
   * find
   * ------------------------------------------------------------------------ */

  findClosest (selector, options) {
    selector = this._normalizeSelector(selector)

    return retry(() => this._findClosest(selector), this.retryOptions)
      .then((el) => this._createFromEl(el, options))
  }

  _findClosest (selector) {
    return this._findByScript(findClosestScript, this._el, selector)
  }

  /* ---------------------------------------------------------------------------
   * wait
   * ------------------------------------------------------------------------ */

  waitUntil (name, ...args) {
    const methodName = this.elementWaitAliases[name] || name

    // if a wd el is passed -> parse it into a raw WebElement
    if (args[0] && args[0]._el) {
      args[0] = args[0]._el
    }

    if (!this.driver.elementWaitMethods.has(methodName)) {
      throw new Error(`No waitUntil command exists by the name: ${name}`)
    } else if (this.elementWaitAliases[name]) {
      return this.driver.waitUntil(methodName, ...[this].concat(args))
    } else if (args[0] instanceof wd.WebElement) {
      return this.driver.waitUntil(methodName, ...args)
    }

    return this.find(args[0])
      .then((el) => this.driver.waitUntil(methodName, ...[el].concat(args.slice(1))))
  }

}
