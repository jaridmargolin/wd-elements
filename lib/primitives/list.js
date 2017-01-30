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

}
