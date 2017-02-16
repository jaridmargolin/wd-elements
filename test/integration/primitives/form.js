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

const appPath = path.join(__dirname, '..', 'fixtures', 'app.html')
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
    this.form = await this.driver.find('#form')
  })

  it('Should fill out fields', async function () {
    await this.form.fillFields({
      '@name.enabled': 'hello',
      '@name.select': 'Value',
      '@name.checkbox': true,
      '@name.radio': '2'
    })

    assert.equal(await this.form.on('@name.enabled', 'read'), 'hello')
    assert.equal(await this.form.on('@name.select', 'read'), 'Value')
    assert.isTrue(await this.form.on('@name.checkbox', 'read'))
    assert.isFalse(await this.form.on('#radio-1', 'read'))
    assert.isTrue(await this.form.on('#radio-2', 'read'))
  })
})
