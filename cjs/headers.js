'use strict';
const {createHash} = require('crypto');
const {createReadStream, stat, unwatchFile, watchFile, writeFile} = require('fs');
const {extname} = require('path');

const mime = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('mime-types'));
const umap = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('umap'));

const {lookup} = mime;
const {stringify} = JSON;

const cache = new Map;
const wrap = umap(cache);

const getLastModified = source => (
  wrap.get(source) ||
  wrap.set(source, new Promise((res, rej) => {
    stat(source, (err, stats) => {
      /* istanbul ignore next */
      if (err) rej(err);
      else res(new Date(stats.mtimeMs).toUTCString());
    });
  }))
);

const getHash = source => new Promise(res => {
  const hash = createHash('sha1');
  const input = createReadStream(source);
  input.on('readable', () => {
    const data = input.read();
    if (data)
      hash.update(data, 'utf-8');
    else
      res(hash.digest('base64'));
  });
});

module.exports = (source, dest, headers = {}) => new Promise((res, rej) => {
  getLastModified(source).then(
    lastModified => {
      stat(dest, (err, stats) => {
        /* istanbul ignore next */
        if (err) rej(err);
        else {
          const {size} = stats;
          const ext = extname(dest.replace(/(?:\.(br|deflate|gzip))?$/, ''));
          getHash(dest).then(hash => {
            writeFile(
              dest + '.json',
              stringify({
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=0',
                'Content-Type': lookup(ext) + (
                  /^\.(?:css|html?|json|md|txt|xml|yml)$/.test(ext) ?
                    '; charset=UTF-8' : ''
                ),
                'Content-Length': size,
                'Last-Modified': lastModified,
                ETag: `"${size.toString(16)}-${hash.substring(0, 16)}"`,
                ...headers
              }),
              err => {
                cache.delete(source);
                /* istanbul ignore next */
                if (err) rej(err);
                else res(dest);
              }
            );
          });
        }
      });
    },
    rej
  );
});
