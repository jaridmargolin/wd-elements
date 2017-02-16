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
    return this._findField(selector, field => field.hasValue(val))
      .then(field => this.fillEl(field, val))
  }

  fillEl (el, val) {
    return el.getAttribute('type')
      .then(type => type === 'radio' ? el.fill(true) : el.fill(val))
  }

  readFields (fields, ...additional) {
    return Promise.reduce(_.concat(fields, ...additional), (fields, field) => {
      return this.readField(field).then(val => _.extend(fields, { [field]: val }))
    }, {})
  }

  readField (selector) {
    return this._findField(selector, field => field.isSelected())
      .then(field => this.readEl(field))
  }

  readEl (el, val) {
    return el.getAttribute('type')
      .then(type => type === 'radio' ? el.getValue() : el.read())
  }

  submit (data = {}) {
    return data
      ? this.fill(data).then(__ => this._submit())
      : this._submit()
  }

  _findField (selector, filter) {
    return this.findAll(selector).then(fields => {
      return fields.length > 1 ? Promise.filter(fields, filter) : fields
    }).then(fields => fields[0])
  }

  _submit () {
    return this.findForm()
      .then(form => form._el.submit())
  }

}
