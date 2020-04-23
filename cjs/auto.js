'use strict';
const {extname} = require('path');

const copy = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./copy.js'));
const css = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./css.js'));
const gif = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./gif.js'));
const html = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./html.js'));
const jpg = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./jpg.js'));
const js = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./js.js'));
const png = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./png.js'));
const svg = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./svg.js'));
const xml = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./xml.js'));

/**
 * Create a file after minifying or optimizing it, when possible.
 * @param {string} source The source file to optimize.
 * @param {string} dest The optimized destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */

module.exports = (source, dest, options = {}) => {
  let method = copy;
  switch (extname(source).toLowerCase()) {
    case '.css':
      method = css;
      break;
    case '.gif':
      method = gif;
      break;
    /* istanbul ignore next */
    case '.htm':
    case '.html':
      method = html;
      break;
    case '.jpg':
    case '.jpeg':
      method = jpg;
      break;
    case '.js':
      method = js;
      break;
    case '.png':
      method = png;
      break;
    case '.svg':
      method = svg;
      break;
    case '.xml':
      method = xml;
      break;
  }
  return method(source, dest, options);
};
