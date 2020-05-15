import {stat, readdir} from 'fs';

import {extname, join} from 'path';

import compressed from './compressed.js';
import copy from './copy.js';
import css from './css.js';
import gif from './gif.js';
import html from './html.js';
import jpg from './jpg.js';
import js from './js.js';
import json from './json.js';
import md from './md.js';
import png from './png.js';
import svg from './svg.js';
import xml from './xml.js';

const crawl = (source, options) => new Promise((res, rej) => {
  stat(source, (err, stat) => {
    /* istanbul ignore if */
    if (err)
      rej(err);
    else {
      if (stat.isFile())
        copy(source, source, options).then(res, rej);
      /* istanbul ignore else */
      else if (stat.isDirectory())
        readdir(source, (err, files) => {
          /* istanbul ignore if */
          if (err)
            rej(err);
          else
            Promise.all(files
              .filter(file => !/^[._]/.test(file))
              .map(file => crawl(join(source, file), options))
            ).then(res, rej);
        });
    }
  });
});

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
    case '.mjs':
      method = js;
      break;
    case '.json':
      method = json;
      break;
    case '.md':
      method = md;
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

ucompress.createHeaders = (source, headers = {}) =>
                            crawl(source, {createFiles: true, headers});

ucompress.copy = copy;
ucompress.css = css;
ucompress.gif = gif;
ucompress.html = html;
ucompress.htm = html;
ucompress.jpg = jpg;
ucompress.jpeg = jpg;
ucompress.js = js;
ucompress.mjs = js;
ucompress.json = json;
ucompress.md = md;
ucompress.png = png;
ucompress.svg = svg;
ucompress.xml = xml;

export default ucompress;
