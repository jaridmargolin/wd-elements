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
      'item': '> li'
    }
  }

  /* ---------------------------------------------------------------------------
   * find
   * ------------------------------------------------------------------------ */

  findFirstItem () {
    return this.find('@child.item')
  }

  findLastItem () {
    return this.findLast('@child.item')
  }

}
