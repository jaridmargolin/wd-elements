'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
const El = require('./el')

/* -----------------------------------------------------------------------------
 * Field
 * -------------------------------------------------------------------------- */

module.exports = class Field extends El {

  static matches (el) {
    const fieldTagNames = ['input', 'textarea', 'select', 'radio', 'checkbox']

    return el.getTagName()
      .then(tagName => fieldTagNames.includes(tagName))
  }

}
