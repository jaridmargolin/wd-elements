'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
const fs = require('fs')
const path = require('path')

// 3rd party
const _ = require('lodash')
const Promise = require('bluebird')
const callsites = require('callsites')
const requireDir = require('require-directory')

/* -----------------------------------------------------------------------------
 * Primitives
 * -------------------------------------------------------------------------- */

module.exports = class Primitives extends Map {

  set (name, Class) {
    let depth = 0
    let CurClass = Class

    // we know `El` will is our root element so we can explicitly search for it
    while (CurClass.name !== 'El') {
      CurClass = Object.getPrototypeOf(CurClass)
      depth++
    }

    this.levels = this.levels || []
    this.levels[depth] = this.levels[depth] || []
    this.levels[depth].push(Class)

    return super.set.call(this, name, Class)
  }

  load (filePath) {
    if (!filePath.startsWith('/')) {
      filePath = path.join(this._getCallerDir(), filePath)
    }

    if (!filePath.startsWith('/')) {
      filePath = path.join(process.cwd(), filePath)
    }

    const stat = fs.statSync(filePath)

    return stat.isDirectory()
      ? this._loadDir(filePath)
      : this._loadFile(filePath)
  }

  findByEl (el) {
    const Classes = _.flatten(this.levels.slice().reverse())
    const results = Promise.mapSeries(Classes, (Class) => {
      return Class.matches(el).then((isMatch) => isMatch ? Class : false)
    })

    return results.then((results) => _.find(results))
  }

  /* ---------------------------------------------------------------------------
   * utils
   * ------------------------------------------------------------------------ */

  _getCallerDir () {
    const c = callsites()

    let fileName = c[0].getFileName()
    for (let i = 1; i < c.length && fileName.includes('lib/primitives.js'); i++) {
      fileName = c[i].getFileName()
    }

    return path.dirname(fileName)
  }

  _loadDir (dirPath) {
    _.each(requireDir(module, dirPath), (Class) => {
      this.set(Class.name, Class)
    })
  }

  _loadFile (filePath) {
    const Class = require(filePath)
    this.set(Class.name, Class)
  }

}
