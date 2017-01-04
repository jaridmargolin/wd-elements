/* eslint-env mocha */
'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const assert = require('chai').assert

// lib
const WDE = require('../../lib/index')
const El = require('../../lib/primitives/el')

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('WDE', function () {
  this.timeout(10000)

  it('Should throw if driver is not inherited from installed Driver', function () {
    assert.throws(function () { WDE({}) })
  })

  it('Should not wrap the driver more than once', function () {
    const driver1 = WDE(this.driver)
    const driver2 = WDE(driver1)

    assert.equal(driver1, driver2)
  })

  it('Should proxy primitive Classes', function () {
    assert.equal(WDE.El, El)
  })

  it('Should proxy primitive methods', function () {
    assert.isFunction(WDE.load)
  })
})
