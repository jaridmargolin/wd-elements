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

describe('List', function () {
  this.timeout(10000)

  before(function () {
    this.returnDriver = (browser) => WDE(browser.driver)
  })

  beforeEach(async function () {
    await this.driver.get(appUrl)
    this.list = await this.driver.find('#list')
  })

  it('Should only return direct descendents.', async function () {
    const items = await this.list.findAll('@child.item')
    assert.equal(items.length, 4)
  })

  it('Should return the first item.', async function () {
    const first = await this.list.findFirstItem()
    assert.equal(await first.getText(), 'First')
  })

  it('Should return the last item.', async function () {
    const last = await this.list.findLastItem()
    assert.equal(await last.getText(), 'Last')
  })
})
