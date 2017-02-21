'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
const FieldInterface = require('./field')

/* -----------------------------------------------------------------------------
 * SelectableFieldInterface
 * -------------------------------------------------------------------------- */

module.exports = class SelectableFieldInterface extends FieldInterface {

  fill (val) {
    return this.read()
      .then(isChecked => isChecked === val ? null : this.click())
  }

  read () {
    return this.isSelected()
  }

}
