'use strict'

/* -----------------------------------------------------------------------------
 * FieldInterface
 * -------------------------------------------------------------------------- */

module.exports = class FieldInterface {

  // default functionality - overwrite
  fill (val) {
    return this.clear()
      .catch(__ => null)
      .then(__ => this.sendKeys(val))
  }

  // default functionality - overwrite
  read () {
    return this.getValue()
  }

  /* ---------------------------------------------------------------------------
   * data accessors
   * ------------------------------------------------------------------------ */

  getValue () {
    return this.getAttribute('value')
  }

  /* ---------------------------------------------------------------------------
   * checks
   * ------------------------------------------------------------------------ */

  hasValue (expected) {
    return this.getValue()
      .then(val => val === expected)
  }

}
