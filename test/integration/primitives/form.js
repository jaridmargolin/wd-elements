/* eslint-env mocha */
'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
const path = require('path')

// 3rd party
const assert = require('chai').assert

// lib
const WDE = require('../../../lib/index')

/* -----------------------------------------------------------------------------
 * reusable
 * -------------------------------------------------------------------------- */

const appPath = path.join(__dirname, 'fixtures', 'app.html')
const appUrl = `file://${appPath}`

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('Form', function () {
  this.timeout(10000)

  before(function () {
    this.returnDriver = (browser) => WDE(browser.driver)
  })

  beforeEach(async function () {
    await this.driver.get(appUrl)
  })

  it('Should', function () {
    assert.isTrue(true)
  })
})
