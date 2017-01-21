'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const _ = require('lodash')
const Promise = require('bluebird')

// lib
const retryPromise = require('./utils/retry-promise')

/* -----------------------------------------------------------------------------
 * El
 * -------------------------------------------------------------------------- */

module.exports = class Finder {

  static lookupUsing (primitives) {
    this.primitives = primitives
  }

  static createUsing (driver) {
    this.driver = driver
  }

  static get retryInterval () {
    return this._retryInterval || 10
  }

  static set retryInterval (val) {
    return (this._retryInterval = val)
  }

  static get retryTimeout () {
    return this._retryTimeout || 5000
  }

  static set retryTimeout (val) {
    return (this._retryTimeout = val)
  }

  get children () {
    return {}
  }

  get retryInterval () {
    return this._retryInterval || this.constructor.retryInterval
  }

  set retryInterval (val) {
    return (this._retryInterval = val)
  }

  get retryTimeout () {
    return this._retryTimeout || this.constructor.retryTimeout
  }

  set retryTimeout (val) {
    return (this._retryTimeout = val)
  }

  get retryOptions () {
    return _.pick(this, 'retryInterval', 'retryTimeout')
  }

  constructor (root) {
    this.root = root
    this.primitives = this.constructor.primitives
    this.driver = this.constructor.driver
    this.definitions = _.mapValues(this.children, this._parseChild)

    // alias
    this.find = this.findElement
    this.findAll = this.findElements
  }

  proxyTo (key) {
    return new Proxy(this, {
      get: (target, name) => name in target ? target[name] : target[key][name]
    })
  }

  /* ---------------------------------------------------------------------------
   * find methods
   * ------------------------------------------------------------------------ */

  findElement (_by, _options) {
    const { by, options } = this._normalizeFindArgs(_by, _options)

    return retryPromise(__ => this.root.findElement(by), this.retryOptions)
      .then((el) => this._createFromEl(el, options))
  }

  findElements (_by, _options) {
    const { by, options } = this._normalizeFindArgs(_by, _options)

    return retryPromise(__ => this.root.findElements(by), this.retryOptions)
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
   * utils
   * ------------------------------------------------------------------------ */

  _normalizeFindArgs (by, options) {
    if (_.isString(by) && by.startsWith('@child.') && this.definitions) {
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
      return { css: this._normalizeSelector(by) }
    } else {
      throw new Error(`Unreconized lookup value`)
    }
  }

  _normalizeSelector (selector) {
    return selector.startsWith('@name.')
      ? `[name="${selector.split('@name.')[1]}"]`
      : selector
  }

  _createFromEl (el, options = {}) {
    if (options.Class) {
      return Promise.resolve(new options.Class(el, options))
    }

    return this.primitives.findByEl(el)
      .then((Class) => new Class(el, options))
  }

  _parseChild (raw) {
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

}
