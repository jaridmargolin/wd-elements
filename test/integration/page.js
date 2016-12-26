/* eslint-env mocha */
'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
const path = require('path')

// 3rd party
const assert = require('chai').assert
const webdriver = require('selenium-webdriver')

// lib
const WDElements = require('../../lib/index')

/* -----------------------------------------------------------------------------
 * reusable
 * -------------------------------------------------------------------------- */

const WDE = WDElements(webdriver)
const appPath = path.join(__dirname, 'fixtures', 'app.html')
const appUrl = `file://${appPath}`
const otherPath = path.join(__dirname, 'fixtures', 'other.html')
const otherUrl = `file://${otherPath}`

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('Page', function () {
  this.timeout(10000)

  beforeEach(async function () {
    await this.driver.get(appUrl)
    this.page = await WDE.Page.create(this.driver)
  })

  /* ---------------------------------------------------------------------------
   * instantiate
   * ------------------------------------------------------------------------ */

  describe('instantiate', function () {
    it('Should create instance of El without specifying selector', async function () {
      assert.instanceOf(this.page, WDE.El)
      assert.instanceOf(this.page._el, webdriver.WebElement)
    })
  })

  /* ---------------------------------------------------------------------------
   * getters
   * ------------------------------------------------------------------------ */

  describe('getters', function () {
    it('Should getCurrentUrl of page', async function () {
      assert.equal(await this.page.getCurrentUrl(), encodeURI(appUrl))
    })

    it('Should getTitle of page', async function () {
      assert.equal(await this.page.getTitle(), 'Test - App')
    })

    it('Should getSource of page', async function () {
      assert.include(await this.page.getSource(), '<!DOCTYPE html>')
    })
  })

  /* ---------------------------------------------------------------------------
   * actions
   * ------------------------------------------------------------------------ */

  describe('actions', function () {
    it('Should navigateTo page', async function () {
      await this.page.navigateTo(otherUrl)
      await this.page.waitUntilStale()
    })

    it('Should refresh page', async function () {
      await this.page.refresh()
      await this.page.waitUntilStale()
    })

    it('Should executeAsyncScript on page', async function () {
      const result = await this.page.executeAsyncScript(function () {
        var callback = arguments[0]
        setTimeout(function () { callback(1) }, 0)
      })

      assert.equal(result, 1)
    })

    it('Should executeScript on page', async function () {
      assert.equal(await this.page.executeScript('return 1'), 1)
    })

    it('Should close page', async function () {
      await this.page.close()

      try {
        await this.page.waitUntilStale()
      } catch (e) {
        assert.include(e.message, 'no such session')
        // TODO: find way to clean up session after closing the last window
        // Could be fixed in Admiral? Could be fixed in selenium?
        this.page.driver.session_ = null
      }
    })
  })

  /* ---------------------------------------------------------------------------
   * wait
   * ------------------------------------------------------------------------ */

  describe('wait methods', function () {
    it('Should waitUntilAbleToSwitchToFrame', async function () {
      await this.page.waitUntilAbleToSwitchToFrame('iframe')
    })

    it('Should waitUntilAlertIsPresent', async function () {
      await this.driver.executeScript(`setTimeout(function () { alert('test') }, 1)`)
      const alert = await this.page.waitUntilAlertIsPresent()
      await alert.accept()
    })

    it('Should waitUntilTitleContains', async function () {
      await this.page.waitUntilTitleContains('App')
    })

    it('Should waitUntilTitleIs', async function () {
      await this.page.waitUntilTitleIs('Test - App')
    })

    it('Should waitUntilTitleMatches', async function () {
      await this.page.waitUntilTitleMatches(/^T/)
    })

    it('Should waitUntilUrlContains', async function () {
      await this.page.waitUntilUrlContains('app.html')
    })

    it('Should waitUntilUrlIs', async function () {
      await this.page.waitUntilUrlIs(encodeURI(appUrl))
    })

    it('Should waitUntilUrlMatches', async function () {
      await this.page.waitUntilUrlMatches(/^file/)
    })
  })
})
