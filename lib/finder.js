'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const _ = require('lodash')
const Promise = require('bluebird')
const retry = require('bluebird-retry')

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
    return {
      interval: this.retryInterval,
      timeout: this.retryTimeout,
      throw_original: true
    }
  }

  constructor (root) {
    this.root = root
    this.primitives = this.constructor.primitives
    this.driver = this.constructor.driver
    this.definitions = _.mapValues(this.children, this._parseChild)

    // alias
    this.find = this.findElement
    this.findAll = this.findElements
    this.on = this.onElement
    this.onAll = this.onElements
  }

  proxyTo (key) {
    return new Proxy(this, {
      get: (target, name) => name in target ? target[name] : target[key][name]
    })
  }

  /* ---------------------------------------------------------------------------
   * find methods
   * ------------------------------------------------------------------------ */

  findElement (definition) {
    definition = this._normalizeDefinition(definition)

    return retry(__ => this.root.findElement(definition), this.retryOptions)
      .then((el) => this._createFromEl(el, definition))
  }

  findElements (definition) {
    definition = this._normalizeDefinition(definition)

    return retry(__ => this.root.findElements(definition), this.retryOptions)
      .then((els) => Promise.mapSeries(els, (el) => this._createFromEl(el, definition)))
  }

  findLast (definition) {
    return this.findElements(definition)
      .then((els) => _.last(els))
  }

  findNth (definition, n) {
    return this.findElements(definition)
      .then((els) => els[n])
  }

  _findByScript (script, ...args) {
    return this.driver.executeScript(script, ...args).then(el => {
      if (!el) { throw new Error(`Unable to find element`) }
      return el
    })
  }

  /* ---------------------------------------------------------------------------
   * on methods
   * ------------------------------------------------------------------------ */

  onElement (definition, methodName, ...args) {
    return this.findElement(definition)
      .then(el => el[methodName](...args))
  }

  onElements (definition, methodName, ...args) {
    return this.findElements(definition)
      .then(els => Promise.mapSeries(els, el => el[methodName](...args)))
  }

  onLast (definition, methodName, ...args) {
    return this.findLast(definition)
      .then(el => el[methodName](...args))
  }

  onNth (definition, n, methodName, ...args) {
    return this.findNth(definition, n)
      .then(el => el[methodName](...args))
  }

  /* ---------------------------------------------------------------------------
   * checks
   * ------------------------------------------------------------------------ */

  exists (definition) {
    definition = this._normalizeDefinition(definition)

    return this.root.findElement(definition)
      .then(__ => true)
      .catch(__ => false)
  }

  /* ---------------------------------------------------------------------------
   * utils
   * ------------------------------------------------------------------------ */

  _normalizeDefinition (definition) {
    if (_.isString(definition) && definition.startsWith('@child.')) {
      definition = this._getDefinition(definition.split('@child.')[1])
    }

    if (_.isString(definition)) {
      definition = { css: this._normalizeSelector(definition) }
    }

    return definition
  }

  _getDefinition (childName) {
    const definition = this.definitions[childName]

    if (_.isUndefined(definition)) {
      throw new Error(`No child found by the name: ${childName}`)
    }

    return definition
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
      definition = { css: raw }
    }

    if (!definition) {
      throw new Error(`Definition type not recognized`)
    }

    return definition
  }

}
