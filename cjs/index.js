'use strict';
const {extname} = require('path');

const compressed = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./compressed.js'));
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
const ucompress = (source, dest, options = {}) => {
  let method = copy;
  switch (extname(source).toLowerCase()) {
    case '.css':
      method = css;
      break;
    case '.gif':
      method = gif;
      break;
    case '.html':
    /* istanbul ignore next */
    case '.htm':
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

ucompress.compressed = new Set([...compressed]);

ucompress.copy = copy;
ucompress.css = css;
ucompress.gif = gif;
ucompress.html = html;
ucompress.htm = html;
ucompress.jpg = jpg;
ucompress.jpeg = jpg;
ucompress.js = js;
ucompress.png = png;
ucompress.svg = svg;
ucompress.xml = xml;

module.exports = ucompress;
