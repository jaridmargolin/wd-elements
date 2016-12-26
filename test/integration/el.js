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

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('El', function () {
  this.timeout(10000)

  /* ---------------------------------------------------------------------------
   * wd
   * ------------------------------------------------------------------------ */

  describe('wd', function () {
    afterEach(function () {
      delete WDE.El._wd
    })

    it('Should use set wd version', function () {
      const tempWD = {}
      const TempWDE = WDElements(tempWD)

      assert.equal(TempWDE.El.wd, tempWD)
      WDElements(webdriver)
    })

    it('Should have access to wd in subclass', function () {
      const tempWD = {}
      const TempWDE = WDElements(tempWD)

      class CustomEl extends TempWDE.El {}
      assert.equal(CustomEl.wd, tempWD)
      WDElements(webdriver)
    })
  })

  /* ---------------------------------------------------------------------------
   * instantiate
   * ------------------------------------------------------------------------ */

  describe('instantiate', function () {
    beforeEach(async function () {
      await this.driver.get(appUrl)
    })

    it('Should create instance of El', async function () {
      const app = await WDE.El.create(this.driver, '#app')
      assert.instanceOf(app, WDE.El)
    })
  })

  /* ---------------------------------------------------------------------------
   * data
   * ------------------------------------------------------------------------ */

  describe('data', function () {
    beforeEach(async function () {
      await this.driver.get(appUrl)
    })

    it('Should be able to specify getter args', async function () {
      class CustomParagraph extends WDE.El {
        get properties () { return ['attribute:data-test'] }
      }

      const paragraph = await CustomParagraph.create(this.driver, 'p')
      assert.deepEqual(await paragraph.data(), { 'attribute:data-test': 'val1' })
    })

    it('Should return all properties', async function () {
      class CustomParagraph extends WDE.El {
        get properties () { return ['text', 'attribute:data-test'] }
      }

      const paragraph = await CustomParagraph.create(this.driver, 'p')
      assert.deepEqual(await paragraph.data(), {
        'text': 'Paragraph1',
        'attribute:data-test': 'val1'
      })
    })

    it('Should return only the specified property', async function () {
      class CustomParagraph extends WDE.El {
        get properties () { return ['text', 'attribute:data-test'] }
      }

      const paragraph = await CustomParagraph.create(this.driver, 'p')
      assert.deepEqual(await paragraph.data('text'), {
        'text': 'Paragraph1'
      })
    })
  })

  /* ---------------------------------------------------------------------------
   * child interface
   * ------------------------------------------------------------------------ */

  describe('child interface', function () {
    before(async function () {
      await this.driver.get(appUrl)
    })

    it('Should cache access to definitions', async function () {
      const app = await WDE.El.create(this.driver, '#app')
      assert.equal(app.definitions, app.definitions)
    })

    it('Should get child by string definition', async function () {
      class AppEl extends WDE.El {
        get children () {
          return { 'heading': 'h1' }
        }
      }

      const app = await AppEl.create(this.driver, '#app')
      const heading = await app.find('@child.heading')

      assert.instanceOf(heading, WDE.El)
    })

    it('Should get child by object definition', async function () {
      class AppEl extends WDE.El {
        get children () {
          return { 'heading': { by: 'h1' } }
        }
      }

      const app = await AppEl.create(this.driver, '#app')
      const heading = await app.find('@child.heading')

      assert.instanceOf(heading, WDE.El)
    })

    it('Should return child of specified Class', async function () {
      class HeadingEl extends WDE.El {}
      class AppEl extends WDE.El {
        get children () {
          return { 'heading': { by: 'h1', Class: HeadingEl } }
        }
      }

      const app = await AppEl.create(this.driver, '#app')
      const heading = await app.find('@child.heading')

      assert.instanceOf(heading, HeadingEl)
    })

    it('Should return all matching children', async function () {
      class AppEl extends WDE.El {
        get children () {
          return { 'paragraph': 'p' }
        }
      }

      const app = await AppEl.create(this.driver, '#app')
      const paragraphs = await app.findAll('@child.paragraph')

      assert.equal(paragraphs.length, 2)
      assert.instanceOf(paragraphs[0], WDE.El)
      assert.instanceOf(paragraphs[1], WDE.El)
    })
  })

  /* ---------------------------------------------------------------------------
   * primitives interface
   * ------------------------------------------------------------------------ */

  describe('primitives', function () {
    before(async function () {
      await this.driver.get(appUrl)
    })

    it('Should use the first matching primitive', async function () {
      class HeadingEl extends WDE.El {
        static matches () { return Promise.resolve(true) }
      }
      WDE.set('HeadingEl', HeadingEl)

      const app = await WDE.El.create(this.driver, '#app')
      const heading = await app.find('h1')

      assert.instanceOf(heading, HeadingEl)
      WDE.delete('HeadingEl')
    })

    it('Should load from relative path', async function () {
      WDE.load('./fixtures/primitives')

      assert.equal(Object.getPrototypeOf(WDE.HeadingEl), WDE.El)
    })
  })

  /* ---------------------------------------------------------------------------
   * find methods
   * ------------------------------------------------------------------------ */

  describe('find', function () {
    before(async function () {
      await this.driver.get(appUrl)
      this.app = await WDE.El.create(this.driver, '#app')
    })

    it('Should find by string selector', async function () {
      const heading = await this.app.find('h1')
      assert.instanceOf(heading, WDE.El)
    })

    it('Should find by `byHash`', async function () {
      const heading = await this.app.find({ css: 'h1' })
      assert.instanceOf(heading, WDE.El)
    })

    it('Should findAll', async function () {
      const paragraphs = await this.app.findAll('p')

      assert.equal(paragraphs.length, 2)
      assert.instanceOf(paragraphs[0], WDE.El)
      assert.instanceOf(paragraphs[1], WDE.El)
    })

    it('Should findLast', async function () {
      const paragraphs = await this.app.findAll('p')
      const lastParagraph = await this.app.findLast('p')

      assert.equal(await lastParagraph._el.getId(), await paragraphs[1]._el.getId())
    })

    it('Should findNth', async function () {
      const paragraphs = await this.app.findAll('p')
      const nthParagraph = await this.app.findNth('p', 1)

      assert.equal(await nthParagraph.getText(), await paragraphs[1].getText())
    })
  })

  /* ---------------------------------------------------------------------------
   * wait
   * ------------------------------------------------------------------------ */

  describe('wait helper', function () {
    beforeEach(async function () {
      await this.driver.get(appUrl)
      this.app = await WDE.El.create(this.driver, '#app')
    })

    it('Should work with no passed element', async function () {
      const input = await this.app.find('#enabled')
      await input._waitUntilEl('elementIsEnabled')
    })

    it('Should work with passed element', async function () {
      const input = await this.app.find('#enabled')
      await this.app._waitUntilEl('elementIsEnabled', input)
    })

    it('Should work with passed selector', async function () {
      await this.app._waitUntilEl('elementIsEnabled', '#enabled')
    })

    it('Should work with passed query object', async function () {
      await this.app._waitUntilEl('elementIsEnabled', { css: '#enabled' })
    })
  })

  describe('wait methods', function () {
    beforeEach(async function () {
      await this.driver.get(appUrl)
      this.app = await WDE.El.create(this.driver, '#app')
    })

    it('Should waitUntilEnabled', async function () {
      const el = await this.app.waitUntilEnabled('#enabled')
      assert.instanceOf(el, WDE.El)
    })

    it('Should waitUntilDisabled', async function () {
      const el = await this.app.waitUntilDisabled('#disabled')
      assert.instanceOf(el, WDE.El)
    })

    it('Should waitUntilSelected', async function () {
      const el = await this.app.waitUntilSelected('#selected-option')
      assert.instanceOf(el, WDE.El)
    })

    it('Should waitUntilNotSelected', async function () {
      const el = await this.app.waitUntilNotSelected('#unselected-option')
      assert.instanceOf(el, WDE.El)
    })

    it('Should waitUntilVisible', async function () {
      const el = await this.app.waitUntilVisible('#visible')
      assert.instanceOf(el, WDE.El)
    })

    it('Should waitUntilNotVisibile', async function () {
      const el = await this.app.waitUntilNotVisible('#hidden')
      assert.instanceOf(el, WDE.El)
    })

    it('Should waitUntilStale', async function () {
      this.driver.executeScript(`var app = document.querySelector('#app'); app.parentNode.removeChild(app);`)
      await this.app.waitUntilStale()
    })

    it('Should waitUntilTextContains', async function () {
      const el = await this.app.waitUntilTextContains('Tes', 'h1')
      assert.instanceOf(el, WDE.El)
    })

    it('Should waitUntilTextIs', async function () {
      const el = await this.app.waitUntilTextIs('Test', 'h1')
      assert.instanceOf(el, WDE.El)
    })

    it('Should waitUntilTextMatches', async function () {
      const el = await this.app.waitUntilTextMatches(/^T/, 'h1')
      assert.instanceOf(el, WDE.El)
    })

    it('Should waitUntilLocated', async function () {
      const el = await this.app.waitUntilLocated('h1')
      assert.instanceOf(el, WDE.El)
    })
  })

  /* ---------------------------------------------------------------------------
   * proxy WebElement
   * ------------------------------------------------------------------------ */

  describe('proxy WebElement', function () {
    before(async function () {
      await this.driver.get(appUrl)
    })

    it('Should contain all instance methods excluding find*', async function () {
      const app = await WDE.El.create(this.driver, '#app')

      // assume if getId is working all methods are working
      assert.isString(await app.getId())
    })
  })
})
