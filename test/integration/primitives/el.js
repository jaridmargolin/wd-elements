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
const WDE = require('../../../lib/index')

/* -----------------------------------------------------------------------------
 * reusable
 * -------------------------------------------------------------------------- */

const appPath = path.join(__dirname, '..', 'fixtures', 'app.html')
const appUrl = `file://${appPath}`

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('El', function () {
  this.timeout(10000)

  before(async function () {
    await browser.wrapBuildFn()
  })

  beforeEach(async function () {
    await browser.driver.get(appUrl)
  })

  after(async function () {
    await browser.unwrapBuildFn()
  })

  /* ---------------------------------------------------------------------------
   * instantiate
   * ------------------------------------------------------------------------ */

  describe('instantiate', function () {
    it('Should create instance of El', async function () {
      const app = await WDE.El.create('#app')

      assert.instanceOf(app, WDE.El)
      assert.equal(app.getDriver(), browser.driver)
    })
  })

  /* ---------------------------------------------------------------------------
   * focus actions
   * ------------------------------------------------------------------------ */

  describe('focus actions', function () {
    beforeEach(async function () {
      this.app = await WDE.El.create('#app')
      this.input = await this.app.find('#enabled')
    })

    it('Should focus on element', async function () {
      await this.input.focus()
      await this.app.find({ css: ':focus' })
    })

    it('Should blur element', async function () {
      await this.input.focus()
      await this.input.blur()

      try {
        await this.app.find({ css: ':focus' })
      } catch (e) {
        return
      }

      throw new Error('Input not blurred')
    })

    it('Should blur currently active element', async function () {
      await this.input.focus()
      await this.app.blurActive()

      try {
        await this.app.find({ css: ':focus' })
      } catch (e) {
        return
      }

      throw new Error('Input not blurred')
    })
  })

  /* ---------------------------------------------------------------------------
   * scroll actions
   * ------------------------------------------------------------------------ */

  describe('scroll actions', function () {
    beforeEach(async function () {
      this.outer = await WDE.El.create('#scrollable-outer')
      this.inner = await this.outer.find('#scrollable-inner')
    })

    it('Should scroll x by delta.', async function () {
      await this.outer.scrollXBy(50)
      await this.outer.scrollXBy(50)

      const pos = await this.outer.getScrollPos()
      assert.equal(pos.scrollLeft, 100)
      assert.equal(pos.scrollTop, 0)
    })

    it('Should scroll y by delta.', async function () {
      await this.outer.scrollYBy(50)
      await this.outer.scrollYBy(50)

      const pos = await this.outer.getScrollPos()
      assert.equal(pos.scrollLeft, 0)
      assert.equal(pos.scrollTop, 100)
    })

    it('Should scroll x to pos.', async function () {
      await this.outer.scrollXTo(50)
      await this.outer.scrollXTo(50)

      const pos = await this.outer.getScrollPos()
      assert.equal(pos.scrollLeft, 50)
      assert.equal(pos.scrollTop, 0)
    })

    it('Should scroll y to pos.', async function () {
      await this.outer.scrollYTo(50)
      await this.outer.scrollYTo(50)

      const pos = await this.outer.getScrollPos()
      assert.equal(pos.scrollLeft, 0)
      assert.equal(pos.scrollTop, 50)
    })

    it('Should scroll to bottom.', async function () {
      await this.outer.scrollToBottom()

      assert.isTrue(await this.outer.isScrolledToBottom())
      assert.isFalse(await this.outer.isScrolledToTop())
    })

    it('Should scroll to top.', async function () {
      await this.outer.scrollToBottom()
      await this.outer.scrollToTop()

      assert.isFalse(await this.outer.isScrolledToBottom())
      assert.isTrue(await this.outer.isScrolledToTop())
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

    it('Should resolve kebab, camel, and snake case property names.', async function () {
      class CustomParagraph extends WDE.El {
        get properties () { return ['kebab-case', 'CamelCase', 'snake_case'] }
        getKebabCase () { return true }
        getCamelCase () { return true }
        getSnakeCase () { return true }
      }

      const paragraph = await CustomParagraph.create('p')
      assert.deepEqual(await paragraph.data(), {
        'kebab-case': true,
        'CamelCase': true,
        'snake_case': true
      })
    })

    it('Should utilze get_, is_, and has_ getter methods.', async function () {
      class CustomParagraph extends WDE.El {
        get properties () { return ['get', 'is', 'has'] }
        getGet () { return true }
        isIs () { return true }
        hasHas () { return true }
      }

      const paragraph = await CustomParagraph.create('p')
      assert.deepEqual(await paragraph.data(), {
        'get': true,
        'is': true,
        'has': true
      })
    })

    it('Should return if the element has a specified class.', async function () {
      const app = await WDE.El.create('#app')

      assert.isTrue(await app.hasClass('multiple'))
      assert.isTrue(await app.hasClass('classnames'))
      assert.isFalse(await app.hasClass('fail'))
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
