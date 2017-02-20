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
const browser = require('./support/browser')

/* -----------------------------------------------------------------------------
 * reusable
 * -------------------------------------------------------------------------- */

const appPath = path.join(__dirname, 'fixtures', 'app.html')
const appUrl = `file://${appPath}`

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('Driver', function () {
  this.timeout(10000)

  before(async function () {
    await browser.wrapBuildFn()
  })

  after(async function () {
    await browser.unwrapBuildFn()
  })

  beforeEach(async function () {
    await browser.driver.get(appUrl)
  })

  /* ---------------------------------------------------------------------------
   * actions
   * ------------------------------------------------------------------------ */

  describe('actions', function () {
    it('Should refresh page', async function () {
      await browser.driver.executeScript('document.title = "changed"')
      await browser.driver.refresh()

      assert.equal(await browser.driver.getTitle(), 'Test - App')
    })
  })

  /* ---------------------------------------------------------------------------
   * wait
   * ------------------------------------------------------------------------ */

  describe('wait', function () {
    it('Should waitUntilTitleContains', async function () {
      await browser.driver.waitUntil('titleContains', 'App')
    })

    it('Should resolve when element passed.', async function () {
      const input = await browser.driver.find('#enabled')
      await browser.driver.waitUntil('elementIsEnabled', input)
    })

    it('Should resolve when query object passed.', async function () {
      await browser.driver.waitUntil('elementIsEnabled', { css: '#enabled' })
    })

    it('Should resolve when selector passed.', async function () {
      await browser.driver.waitUntil('elementIsEnabled', '#enabled')
    })
  })

  /* ---------------------------------------------------------------------------
   * proxy _driver
   * ------------------------------------------------------------------------ */

  describe('proxy _driver', function () {
    it('Should getTitle of page', async function () {
      assert.equal(await browser.driver.getTitle(), 'Test - App')
    })
  })
})
