<h1 align="center">wd-elements</h1>
<div align="center">
  <p>Better elements for selenium-webdriver.</p>
  <div>
  <a href="https://travis-ci.org/jaridmargolin/wd-elements"><img src="https://travis-ci.org/jaridmargolin/wd-elements.svg?branch=master" alt="Build Status"></a>
  <a href="https://coveralls.io/github/jaridmargolin/wd-elements?branch=master"><img src="https://coveralls.io/repos/github/jaridmargolin/wd-elements/badge.svg?branch=master" alt="Coverage Status"></a>
  <a href="http://standardjs.com/"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
  </div>
  <div>
  <a href="https://npmjs.org/package/wd-elements"><img src="https://img.shields.io/npm/v/wd-elements.svg" alt="NPM wd-elements package"></a>
  <a href="https://david-dm.org/jaridmargolin/wd-elements"><img src="https://david-dm.org/jaridmargolin/wd-elements.svg" alt="Dependency Status"></a>
  <a href="https://david-dm.org/jaridmargolin/wd-elements#info=devDependencies"><img src="https://david-dm.org/jaridmargolin/wd-elements/dev-status.svg" alt="devDependency Status"></a>
  </div>
</div>
<br>

## Why

Extensibility. As of now, **selenium-webdriver** exposes a single class, `WebElement`, yet we know the DOM is constructed of more than 58 different elements (thank you google). Now take into account the explosion of CustomElements (polymer, react, etc...). Our front end is built using components, and our integration tests should as well.

The goal of **wd-elements** is to provide a sane and consistent environment to author integration tests around the concept of custom elements.

## Basic Usage

```js
const webdriver = require('selenium-webdriver')
const WDE = require('wd-elements')(webdriver)

const driver = new webdriver.Builder().forBrowser('chrome').build();
const page = WDE.Page.create(driver)

// for the most part WDElements behave like native selenium WebElements
// the true power comes from primitives and extensibility (see advanced usage)
page.find('#app')
  .then((app) => app.find('h1'))
  .then((h1) => h1.getText())
```

## License

The MIT License (MIT) Copyright (c) 2016 Jarid Margolin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
