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

describe('El', function () {
  this.timeout(10000)

  before(function () {
    this.returnDriver = (browser) => WDE(browser.driver)
  })

  beforeEach(async function () {
    await this.driver.get(appUrl)
  })

  /* ---------------------------------------------------------------------------
   * instantiate
   * ------------------------------------------------------------------------ */

  describe('instantiate', function () {
    it('Should create instance of El', async function () {
      const app = await WDE.El.create('#app')

      assert.instanceOf(app, WDE.El)
      assert.equal(app.getDriver(), this.driver)
    })
  })

  /* ---------------------------------------------------------------------------
   * data
   * ------------------------------------------------------------------------ */

  describe('data', function () {
    it('Should return text by default', async function () {
      const paragraph = await WDE.El.create('p')
      assert.deepEqual(await paragraph.data(), { 'text': 'Paragraph1' })
    })

    it('Should be able to specify getter args', async function () {
      class CustomParagraph extends WDE.El {
        get properties () { return ['attribute:data-test'] }
      }

      const paragraph = await CustomParagraph.create('p')
      assert.deepEqual(await paragraph.data(), { 'attribute:data-test': 'val1' })
    })

    it('Should return all properties', async function () {
      class CustomParagraph extends WDE.El {
        get properties () { return ['text', 'attribute:data-test'] }
      }

      const paragraph = await CustomParagraph.create('p')
      assert.deepEqual(await paragraph.data(), {
        'text': 'Paragraph1',
        'attribute:data-test': 'val1'
      })
    })

    it('Should return only the specified property', async function () {
      class CustomParagraph extends WDE.El {
        get properties () { return ['text', 'attribute:data-test'] }
      }

      const paragraph = await CustomParagraph.create('p')
      assert.deepEqual(await paragraph.data('text'), {
        'text': 'Paragraph1'
      })
    })
  })

  /* ---------------------------------------------------------------------------
   * find
   * ------------------------------------------------------------------------ */

  describe('find', function () {
    it('Should implement shortcut methods to automatically pass el', async function () {
      const heading = await WDE.El.create('h1')
      const app = await heading.findClosest('#app')

      assert.instanceOf(app, WDE.El)
    })
  })

  /* ---------------------------------------------------------------------------
   * wait
   * ------------------------------------------------------------------------ */

  describe('wait methods', function () {
    beforeEach(async function () {
      this.app = await WDE.El.create('#app')
    })

    it('Should implement shortcut methods to automatically pass el', async function () {
      const input = await this.app.find('#enabled')
      await input.waitUntil('isEnabled')
    })

    it('Should proxy normal element methods to driver', async function () {
      const input = await this.app.find('#enabled')
      await this.app.waitUntil('elementIsEnabled', input)
    })

    it('Should locally resolve if selector passed for element method', async function () {
      await this.app.waitUntil('elementIsEnabled', '#enabled')
    })

    it('Should throw if method is not supported', function (done) {
      Promise.resolve()
        .then(() => this.app.waitUntil('isAwesome'))
        .catch(() => done())
    })
  })

  /* ---------------------------------------------------------------------------
   * proxy _el
   * ------------------------------------------------------------------------ */

  describe('proxy _el', function () {
    it('Should contain all instance methods excluding find*', async function () {
      const app = await WDE.El.create('#app')

      // assume if getId is working all methods are working
      assert.isString(await app.getId())
    })
  })
})
