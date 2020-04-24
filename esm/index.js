import {extname} from 'path';

import compressed from './compressed.js';
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

export default ucompress;
