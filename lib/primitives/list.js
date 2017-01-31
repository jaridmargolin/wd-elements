'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
const El = require('./el')

/* -----------------------------------------------------------------------------
 * List
 * -------------------------------------------------------------------------- */

module.exports = class List extends El {

  static matches (el) {
    const listTagNames = ['ul', 'ol']

    return el.getTagName()
      .then(tagName => listTagNames.includes(tagName))
  }

  get children () {
    return {
      'item': ':scope > li'
    }
  }

  /* ---------------------------------------------------------------------------
   * data accessors
   * ------------------------------------------------------------------------ */

  getLength () {
    return this.findItems()
      .then(items => items.length)
  }

  /* ---------------------------------------------------------------------------
   * find
   * ------------------------------------------------------------------------ */

  findItems () {
    return this.findAll('@child.item')
  }

  findFirstItem () {
    return this.find('@child.item')
  }

  findNthItem (n) {
    return this.findNth('@child.item', n)
  }

  findLastItem () {
    return this.findLast('@child.item')
  }

  /* ---------------------------------------------------------------------------
   * on
   * ------------------------------------------------------------------------ */

  onItems (...args) {
    return this.onAll('@child.item', ...args)
  }

  onFirstItem (...args) {
    return this.on('@child.item', ...args)
  }

  onNthItem (...args) {
    return this.onNth('@child.item', ...args)
  }

  onLastItem (...args) {
    return this.onLast('@child.item', ...args)
  }

  /* ---------------------------------------------------------------------------
   * utils
   * ------------------------------------------------------------------------ */

  waitUntilLength (length) {
    return this.driver.wait(this.isLength.bind(this, length))
  }

  isLength (length) {
    return this.getLength()
      .then(_length => _length === length)
  }

}
