'use strict';
const {stat, readdir} = require('fs');

const {extname, join} = require('path');

const compressed = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./compressed.js'));
const copy = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./copy.js'));
const css = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./css.js'));
const gif = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./gif.js'));
const html = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./html.js'));
const jpg = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./jpg.js'));
const js = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./js.js'));
const json = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./json.js'));
const md = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./md.js'));
const png = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./png.js'));
const svg = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./svg.js'));
const xml = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./xml.js'));

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

module.exports = ucompress;
