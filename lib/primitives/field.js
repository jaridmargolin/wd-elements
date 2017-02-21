'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
const El = require('./el')
const FieldInterface = require('../interfaces/field')

/* -----------------------------------------------------------------------------
 * Field
 * -------------------------------------------------------------------------- */

module.exports = class Field extends El {

  static matches (el) {
    const fieldTagNames = ['input', 'textarea', 'select', 'radio', 'checkbox']

    return el.getTagName()
      .then(tagName => fieldTagNames.includes(tagName))
  }

  static get interfaces () {
    return this.extendInterfaces(El.interfaces, {
      'field': new FieldInterface()
    })
  }

}
