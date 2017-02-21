'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
const Field = require('./field')
const SelectableFieldInterface = require('../interfaces/selectable-field')

/* -----------------------------------------------------------------------------
 * SelectableField
 * -------------------------------------------------------------------------- */

module.exports = class SelectableField extends Field {

  static matches (el) {
    const fieldTypes = ['radio', 'checkbox']

    return el.getAttribute('type')
      .then(type => fieldTypes.includes(type))
  }

  static get interfaces () {
    return this.extendInterfaces(Field.interfaces, {
      'field': new SelectableFieldInterface()
    })
  }

}
