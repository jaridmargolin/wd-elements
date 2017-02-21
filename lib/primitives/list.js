'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
const El = require('./el')
const ListInterface = require('../interfaces/list')

/* -----------------------------------------------------------------------------
 * List
 * -------------------------------------------------------------------------- */

module.exports = class List extends El {

  static matches (el) {
    const listTagNames = ['ul', 'ol']

    return el.getTagName()
      .then(tagName => listTagNames.includes(tagName))
  }

  static get interfaces () {
    return this.extendInterfaces(El.interfaces, {
      'list': new ListInterface()
    })
  }

}
