'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party (root) // potentially a terrible idea
const wd = require.main.require('selenium-webdriver')

// 3rd party
const _ = require('lodash')
const Promise = require('bluebird')
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
    return this.driver.find({ css: selector, Class: this })
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
   * focus actions
   * ------------------------------------------------------------------------ */

  blur () {
    return this.driver.executeScript(`arguments[0].blur()`, this._el)
      .then(__ => this)
  }

  blurActive () {
    return this.root.findElement({ css: ':focus' })
      .then(el => this._createFromEl(el))
      .then(el => el.blur())
      .catch(e => this)
  }

  focus () {
    return this.driver.executeScript(`arguments[0].focus()`, this._el)
      .then(__ => this)
  }

  /* ---------------------------------------------------------------------------
   * scroll actions
   * ------------------------------------------------------------------------ */

  scrollBy (x = 0, y = 0) {
    let script = `arguments[0].scrollLeft += ${x};`
    script += `arguments[0].scrollTop += ${y};`

    return this.driver.executeScript(script, this._el)
  }

  scrollXBy (delta) {
    return this.scrollBy(delta, 0)
  }

  scrollYBy (delta) {
    return this.scrollBy(0, delta)
  }

  scrollTo (x, y) {
    let script = ''
    if (!_.isUndefined(x)) { script += `arguments[0].scrollLeft = ${x};` }
    if (!_.isUndefined(y)) { script += `arguments[0].scrollTop = ${y};` }

    return this.driver.executeScript(script, this._el)
  }

  scrollXTo (pos) {
    return this.scrollTo(pos, 0)
  }

  scrollYTo (pos) {
    return this.scrollTo(0, pos)
  }

  scrollToTop () {
    return this.scrollTo(undefined, 0)
  }

  scrollToBottom () {
    return this.getAttribute('scrollHeight')
      .then(scrollHeight => this.scrollTo(undefined, scrollHeight))
  }

  /* ---------------------------------------------------------------------------
   * data
   * ------------------------------------------------------------------------ */

  prop (prop) {
    const parts = prop.split(':')
    const name = _.upperFirst(_.camelCase(`${parts[0]}`))
    const getter = this[`get${name}`] || this[`is${name}`] || this[`has${name}`]
    const getterArgs = _.tail(parts)

    return Promise.resolve(getter.apply(this, getterArgs))
  }

  data () {
    const props = arguments.length ? _.toArray(arguments) : this.properties

    return Promise.reduce(props, (props, prop) => {
      return this.prop(prop).then(val => _.extend(props, { [prop]: val }))
    }, {})
  }

  hasClass (className) {
    return this.getAttribute('class')
      .then(classes => classes.split(' ').includes(className))
  }

  getScrollPos () {
    const props = ['scrollTop', 'scrollHeight', 'offsetHeight',
      'scrollLeft', 'scrollWidth', 'offsetWidth']

    return Promise.mapSeries(props, prop => this.getScrollProp(prop))
      .then(results => _.zipObject(props, results))
  }

  getScrollProp (prop) {
    const script = `return arguments[0]['${prop}'];`
    return this.driver.executeScript(script, this._el)
  }

  /* ---------------------------------------------------------------------------
   * checks
   * ------------------------------------------------------------------------ */

  isScrolledToTop () {
    return this.getScrollProp('scrollTop')
      .then(scrollTop => scrollTop === 0)
  }

  isScrolledToBottom () {
    return this.getScrollPos()
      .then(pos => pos.scrollTop >= pos.scrollHeight - pos.offsetHeight)
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
