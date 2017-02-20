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
const browser = require('../support/browser')

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

  before(async function () {
    await browser.wrapBuildFn()
  })

  beforeEach(async function () {
    await browser.driver.get(appUrl)
    this.form = await browser.driver.find('#form')
  })

  after(async function () {
    await browser.unwrapBuildFn()
  })

  it('Should fill/read fields', async function () {
    await this.form.fillFields({
      '@name.enabled': 'hello',
      '@name.select': 'Value',
      '@name.checkbox': true,
      '@name.radio': '2'
    })

    assert.deepEqual(await this.form.readFields([
      '@name.enabled',
      '@name.select',
      '@name.checkbox',
      '@name.radio'
    ]), {
      '@name.enabled': 'hello',
      '@name.select': 'Value',
      '@name.checkbox': true,
      '@name.radio': '2'
    })
  })
})
