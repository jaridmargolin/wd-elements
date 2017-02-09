'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const _ = require('lodash')
const Promise = require('bluebird')

// lib
const El = require('./el')

/* -----------------------------------------------------------------------------
 * Form
 * -------------------------------------------------------------------------- */

module.exports = class Form extends El {

  static matches (el) {
    return el.getTagName()
      .then(tagName => tagName === 'form')
  }

  get children () {
    return {
      'submit': 'button[type="submit"]'
    }
  }

  get defaultValues () {
    return {}
  }

  /* ---------------------------------------------------------------------------
   * find
   * ------------------------------------------------------------------------ */

  findForm () {
    return this.getTagName()
      .then(tagName => tagName === 'form' ? this : this.find('form'))
  }

  /* ---------------------------------------------------------------------------
   * form actions
   * ------------------------------------------------------------------------ */

  fill (data = {}) {
    return this.fillFields(_.extend({}, this.defaultValues, data))
  }

  fillFields (data = {}) {
    const fields = _.map(data, (value, prop) => [prop, value])

    return Promise.each(fields, field => this.fillField(...field))
      .then(__ => this.blurActive())
  }

  fillField (selector, val) {
    return this.find(selector)
      .then(field => field.fill(val))
  }

  submit (data) {
    return data
      ? this.fill(data).then(__ => this._submit())
      : this._submit()
  }

  _submit () {
    return this.findForm()
      .then(form => form._el.submit())
  }

}
