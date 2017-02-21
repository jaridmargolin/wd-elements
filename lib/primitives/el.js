'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const _ = require('lodash')
const Promise = require('bluebird')
const wd = require('selenium-webdriver')

// lib
const Finder = require('../finder')
const ElInterface = require('../interfaces/el')

/* -----------------------------------------------------------------------------
 * El
 * -------------------------------------------------------------------------- */

module.exports = class El extends Finder {

  static create (selector) {
    return this.driver.find({ css: selector, Class: this })
  }

  static matches (el) {
    return Promise.resolve(el instanceof wd.WebElement)
  }

  static extendInterfaces (...interfaces) {
    return _.extend({}, ...interfaces, this._interfaces)
  }

  static setInterface (name, val) {
    if (!this.hasOwnProperty('_interfaces')) {
      this._interfaces = {}
    }

    return _.extend(this._interfaces, {
      [name]: val
    })
  }

  static get interfaces () {
    return _.extend({
      'el': new ElInterface()
    }, this._interfaces)
  }

  get children () {
    return _.extend({}, ...this.getAllFromInterfaces('children'))
  }

  constructor (el) {
    super(el)
    this._el = el

    const proxy = new Proxy(this, {
      get: (target, name) => this.proxyGet.call(proxy, target, name)
    })

    return proxy
  }

  proxyGet (target, name) {
    if (name in target) {
      return target[name]
    }

    const val = this.getFromInterfaces(name)
    return _.isUndefined(val)
      ? target._el[name]
      : val
  }

  getFromInterfaces (name) {
    const vals = this.getAllFromInterfaces(name)

    if (vals.length > 1) {
      throw new Error('Interface collision.')
    }

    return _.isFunction(vals[0])
      ? vals[0].bind(this)
      : vals[0]
  }

  getAllFromInterfaces (name) {
    const rawVals = _.map(this.constructor.interfaces, i => i[name])
    return _.filter(rawVals, val => !_.isUndefined(val))
  }

}
