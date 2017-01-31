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
const Finder = require('../../lib/finder')

/* -----------------------------------------------------------------------------
 * reusable
 * -------------------------------------------------------------------------- */

const appPath = path.join(__dirname, 'fixtures', 'app.html')
const appUrl = `file://${appPath}`

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('Finder', function () {
  this.timeout(10000)

  before(async function () {
    await this.driver.get(appUrl)
  })

  /* ---------------------------------------------------------------------------
   * child interface
   * ------------------------------------------------------------------------ */

  describe('child interface', function () {
    it('Should get child by string definition', async function () {
      class MyFinder extends Finder {
        get children () {
          return { 'heading': 'h1' }
        }
      }

      const myFinder = new MyFinder(this.driver)
      const heading = await myFinder.find('@child.heading')

      assert.instanceOf(heading, WDE.El)
    })

    it('Should get child by object definition', async function () {
      class MyFinder extends Finder {
        get children () {
          return { 'heading': { css: 'h1' } }
        }
      }

      const myFinder = new MyFinder(this.driver)
      const heading = await myFinder.find('@child.heading')

      assert.instanceOf(heading, WDE.El)
    })

    it('Should return child of specified Class', async function () {
      class HeadingEl extends WDE.El {}
      class MyFinder extends Finder {
        get children () {
          return { 'heading': { css: 'h1', Class: HeadingEl } }
        }
      }

      const myFinder = new MyFinder(this.driver)
      const heading = await myFinder.find('@child.heading')

      assert.instanceOf(heading, HeadingEl)
    })

    it('Should return all matching children', async function () {
      class MyFinder extends Finder {
        get children () {
          return { 'paragraph': 'p' }
        }
      }

      const myFinder = new MyFinder(this.driver)
      const paragraphs = await myFinder.findAll('@child.paragraph')

      assert.equal(paragraphs.length, 2)
      assert.instanceOf(paragraphs[0], WDE.El)
      assert.instanceOf(paragraphs[1], WDE.El)
    })
  })

  /* ---------------------------------------------------------------------------
   * primitives interface
   * ------------------------------------------------------------------------ */

  describe('primitives', function () {
    it('Should use the first matching primitive', async function () {
      class HeadingEl extends WDE.El {
        static matches () { return Promise.resolve(true) }
      }
      WDE.set('HeadingEl', HeadingEl)

      const finder = await new Finder(this.driver)
      const heading = await finder.find('h1')

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
      this.finder = new Finder(this.driver)

      this.delayedAddScript = `setTimeout(function () {
        document.body.innerHTML += '<div id="delayed">HELLO</div>'
      }, 1000)`
    })

    it('Should find by string selector', async function () {
      const heading = await this.finder.find('h1')
      assert.instanceOf(heading, WDE.El)
    })

    it('Should find by string @name selector', async function () {
      const input = await this.finder.find('@name.byName')
      assert.instanceOf(input, WDE.El)
    })

    it('Should find by `byHash`', async function () {
      const heading = await this.finder.find({ css: 'h1' })
      assert.instanceOf(heading, WDE.El)
    })

    it('Should findAll', async function () {
      const paragraphs = await this.finder.findAll('p')

      assert.equal(paragraphs.length, 2)
      assert.instanceOf(paragraphs[0], WDE.El)
      assert.instanceOf(paragraphs[1], WDE.El)
    })

    it('Should findLast', async function () {
      const paragraphs = await this.finder.findAll('p')
      const lastParagraph = await this.finder.findLast('p')

      assert.equal(await lastParagraph._el.getId(), await paragraphs[1]._el.getId())
    })

    it('Should findNth', async function () {
      const paragraphs = await this.finder.findAll('p')
      const nthParagraph = await this.finder.findNth('p', 1)

      assert.equal(await nthParagraph.getText(), await paragraphs[1].getText())
    })

    it('Should retry until element is found.', async function () {
      await this.driver.executeScript(this.delayedAddScript)
      await this.finder.find('#delayed')
    })

    it('Should allow setting global timeout.', async function () {
      const originalTimeout = Finder.retryTimeout
      Finder.retryTimeout = 500

      await this.driver.executeScript(this.delayedAddScript)
      return this.finder.find('#delayed')
        .then(__ => { throw new Error('Retry not correctly set') })
        .catch(__ => (Finder.retryTimeout = originalTimeout))
    })

    it('Should allow setting instance timeout.', async function () {
      const originalTimeout = this.finder.retryTimeout
      this.finder.retryTimeout = 500

      await this.driver.executeScript(this.delayedAddScript)
      return this.finder.find('#delayed')
        .then(__ => { throw new Error('Retry not correctly set') })
        .catch(__ => (this.finder.retryTimeout = originalTimeout))
    })
  })
})
