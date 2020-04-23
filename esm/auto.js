import {extname} from 'path';

import copy from './copy.js';
import css from './css.js';
import gif from './gif.js';
import html from './html.js';
import jpg from './jpg.js';
import js from './js.js';
import png from './png.js';
import svg from './svg.js';
import xml from './xml.js';

/**
 * Create a file after minifying or optimizing it, when possible.
 * @param {string} source The source file to optimize.
 * @param {string} dest The optimized destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */

export default (source, dest, options = {}) => {
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
