'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const _ = require('lodash')
const Promise = require('bluebird')

/* -----------------------------------------------------------------------------
 * El
 * -------------------------------------------------------------------------- */

module.exports = class El {

  static configure (wd, primitives) {
    this.wd = wd
    this.primitives = primitives

    this.configured = true
  }

  static create (driver, selector) {
    return driver.findElement({ css: selector })
      .then((el) => new this(el))
  }

  static matches (el) {
    return Promise.resolve(el instanceof this.wd.WebElement)
  }

  get children () {
    return {}
  }

  get properties () {
    return ['text']
  }

  // DO NOT OVERWRITE. Intended to be a computer property of children
  get definitions () {
    if (!this._definitions) {
      this._definitions = _.mapValues(this.children, this._appUrlition)
    }

    return this._definitions
  }

  constructor (el) {
    if (!this.constructor.configured) {
      throw new Error('WDElements must be configured prior to use')
    }

    // _el should not be used directly. Doing so will result in receiving
    // back a raw selenium WebElement and break the chain.
    this._el = el

    this.wd = this.constructor.wd
    this.driver = this._el.getDriver()
    this.primitives = this.constructor.primitives

    // alias
    this.find = this.findElement
    this.findAll = this.findElements

    return this._getWebElementProxy()
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

  findElement (_by, _options) {
    const { by, options } = this._normalizeFindArgs(_by, _options)

    return this._el.findElement(this._normalizeBy(by))
      .then((el) => this._createFromEl(el, options))
  }

  findElements (_by, _options) {
    const { by, options } = this._normalizeFindArgs(_by, _options)

    return this._el.findElements(this._normalizeBy(by))
      .then((els) => Promise.map(els, (el) => this._createFromEl(el, options)))
  }

  findLast (by, options) {
    return this.findElements(by, options)
      .then((els) => _.last(els))
  }

  findNth (by, n, options) {
    return this.findElements(by, options)
      .then((els) => els[n])
  }

  /* ---------------------------------------------------------------------------
   * wait
   * ------------------------------------------------------------------------ */

  waitUntilEnabled (el) {
    return this._waitUntilEl('elementIsEnabled', el)
  }

  waitUntilDisabled (el) {
    return this._waitUntilEl('elementIsDisabled', el)
  }

  waitUntilSelected (el) {
    return this._waitUntilEl('elementIsSelected', el)
  }

  waitUntilNotSelected (el) {
    return this._waitUntilEl('elementIsNotSelected', el)
  }

  waitUntilVisible (el) {
    return this._waitUntilEl('elementIsVisible', el)
  }

  waitUntilNotVisible (el) {
    return this._waitUntilEl('elementIsNotVisible', el)
  }

  waitUntilStale (el) {
    return this._waitUntilEl('stalenessOf', el)
  }

  waitUntilTextContains (substr, el) {
    return this._waitUntilEl('elementTextContains', el, substr)
  }

  waitUntilTextIs (text, el) {
    return this._waitUntilEl('elementTextIs', el, text)
  }

  waitUntilTextMatches (regex, el) {
    return this._waitUntilEl('elementTextMatches', el, regex)
  }

  waitUntilLocated (locator) {
    if (!locator) {
      throw new Error('Locator must be passed')
    } else if (_.isString(locator)) {
      locator = { css: locator }
    }
    return this._waitUntil('elementLocated', locator)
  }

  _waitUntilEl (name, el, arg) {
    el = el || this

    return el instanceof El
      ? this._waitUntil(name, el._el, arg)
      : this.find(el).then((el) => this._waitUntilEl(name, el, arg))
  }

  _waitUntil (name, arg1, arg2) {
    return this.driver.wait(this.wd.until[name](arg1, arg2))
      .then((el) => el instanceof this.wd.WebElement ? this._createFromEl(el) : el)
  }

  /* ---------------------------------------------------------------------------
   * proxy creation
   * ------------------------------------------------------------------------ */

  _getWebElementProxy () {
    return new Proxy(this, { get: this._proxyToWebElement })
  }

  _proxyToWebElement (target, name) {
    if (name in target) {
      return target[name]
    } else if (name in target._el) {
      return target._el[name]
    }
  }

  /* ---------------------------------------------------------------------------
   * utils
   * ------------------------------------------------------------------------ */

  _normalizeFindArgs (by, options) {
    if (_.isString(by) && by.startsWith('@child.')) {
      return this._normalizeFromDefinition(by, options)
    }

    return {
      by: this._normalizeBy(by),
      options: options
    }
  }

  _normalizeFromDefinition (by, options) {
    const definition = this.definitions[by.split('@child.')[1]]

    if (_.isUndefined(definition)) {
      throw new Error(`No child found by the name: ${by}`)
    }

    return {
      by: this._normalizeBy(definition.by),
      options: _.assign({}, _.omit(definition, 'by'), options)
    }
  }

  _normalizeBy (by) {
    if (_.isFunction(by) || _.isObject(by)) {
      return by
    } else if (_.isString(by)) {
      return { css: by }
    } else {
      throw new Error(`Unreconized lookup value`)
    }
  }

  _appUrlition (raw) {
    let definition

    if (_.isObject(raw)) {
      definition = raw
    } else if (_.isString(raw)) {
      definition = { by: raw }
    }

    if (!definition) {
      throw new Error(`Definition type not recognized`)
    } else if (!definition.by) {
      throw new Error(`Definition must contain lookup property`)
    }

    return definition
  }

  _createFromEl (el, options) {
    return this._getElClass(el, options)
      .then((Class) => new Class(el, options))
  }

  _getElClass (el, options = {}) {
    return options.Class
      ? Promise.resolve(options.Class)
      : this.primitives.findByEl(el)
  }

}
