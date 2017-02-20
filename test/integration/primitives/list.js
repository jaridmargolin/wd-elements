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

describe('List', function () {
  this.timeout(10000)

  before(async function () {
    await browser.wrapBuildFn()
  })

  beforeEach(async function () {
    await browser.driver.get(appUrl)
    this.list = await browser.driver.find('#list')
  })

  after(async function () {
    await browser.unwrapBuildFn()
  })

  it('Should only return direct descendents.', async function () {
    const items = await this.list.findItems()
    assert.equal(items.length, 4)
  })

  /* ---------------------------------------------------------------------------
   * data
   * ------------------------------------------------------------------------ */

  it('Should return the list length.', async function () {
    assert.equal(await this.list.getLength(), 4)
  })

  it('Should pluck specified property from items.', async function () {
    assert.deepEqual(await this.list.pluck('text'), [ 'First', 'Second',
      'Nested', 'Last' ])
  })

  /* ---------------------------------------------------------------------------
   * find
   * ------------------------------------------------------------------------ */

  it('Should return the first item.', async function () {
    const first = await this.list.findFirstItem()
    assert.equal(await first.getText(), 'First')
  })

  it('Should return the nth item.', async function () {
    const nth = await this.list.findNthItem(1)
    assert.equal(await nth.getText(), 'Second')
  })

  it('Should return the last item.', async function () {
    const last = await this.list.findLastItem()
    assert.equal(await last.getText(), 'Last')
  })

  /* ---------------------------------------------------------------------------
   * on
   * ------------------------------------------------------------------------ */

  it('Should execute method on the first item.', async function () {
    assert.equal(await this.list.onFirstItem('getText'), 'First')
  })

  it('Should execute method on the nth item.', async function () {
    assert.equal(await this.list.onNthItem(1, 'getText'), 'Second')
  })

  it('Should execute method on the last item.', async function () {
    assert.equal(await this.list.onLastItem('getText'), 'Last')
  })

  it('Should execute method on all items.', async function () {
    const expected = ['First', 'Second', 'Nested', 'Last']
    assert.deepEqual(await this.list.onItems('getText'), expected)
  })

  /* ---------------------------------------------------------------------------
   * utils
   * ------------------------------------------------------------------------ */

  it('Should return if list length matches passed length.', async function () {
    assert.isTrue(await this.list.isLength(4))
    assert.isFalse(await this.list.isLength(5))
  })

  it('Should wait until the list is a specified length.', async function () {
    await this.list.waitUntilLength(4)
  })
})
