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
const WDE = require('../../lib/index')

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

  before(function () {
    this.returnDriver = (browser) => WDE(browser.driver)
  })

  beforeEach(async function () {
    await this.driver.get(appUrl)
  })

  /* ---------------------------------------------------------------------------
   * actions
   * ------------------------------------------------------------------------ */

  describe('actions', function () {
    it('Should refresh page', async function () {
      await this.driver.executeScript('document.title = "changed"')
      await this.driver.refresh()

      assert.equal(await this.driver.getTitle(), 'Test - App')
    })
  })

  /* ---------------------------------------------------------------------------
   * wait
   * ------------------------------------------------------------------------ */

  describe('wait', function () {
    it('Should waitUntilTitleContains', async function () {
      await this.driver.waitUntil('titleContains', 'App')
    })

    it('Should resolve when element passed.', async function () {
      const input = await this.driver.find('#enabled')
      await this.driver.waitUntil('elementIsEnabled', input)
    })

    it('Should resolve when query object passed.', async function () {
      await this.driver.waitUntil('elementIsEnabled', { css: '#enabled' })
    })

    it('Should resolve when selector passed.', async function () {
      await this.driver.waitUntil('elementIsEnabled', '#enabled')
    })
  })

  /* ---------------------------------------------------------------------------
   * proxy _driver
   * ------------------------------------------------------------------------ */

  describe('proxy _driver', function () {
    it('Should getTitle of page', async function () {
      assert.equal(await this.driver.getTitle(), 'Test - App')
    })
  })
})
