'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
const Field = require('./field')

/* -----------------------------------------------------------------------------
 * SelectableField
 * -------------------------------------------------------------------------- */

module.exports = class SelectableField extends Field {

  static matches (el) {
    const fieldTypes = ['radio', 'checkbox']

    return el.getAttribute('type')
      .then(type => fieldTypes.includes(type))
  }

  fill (val) {
    return this.read()
      .then(isChecked => isChecked === val ? null : this.click())
  }

  read () {
    return this.isSelected()
  }

}
