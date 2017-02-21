'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
const El = require('./el')
const FormInterface = require('../interfaces/form')

/* -----------------------------------------------------------------------------
 * Form
 * -------------------------------------------------------------------------- */

module.exports = class Form extends El {

  static matches (el) {
    return el.getTagName()
      .then(tagName => tagName === 'form')
  }

  static get interfaces () {
    return this.extendInterfaces(El.interfaces, {
      'form': new FormInterface()
    })
  }

}
