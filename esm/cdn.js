import {
  createReadStream, stat, mkdir, readFile, unlink,
  existsSync, writeFileSync,
  watchFile, unwatchFile
} from 'fs';
import {tmpdir} from 'os';
import {dirname, extname, join, resolve} from 'path';

import auto from './auto.js';
import compressed from './compressed.js';

const {parse} = JSON;

/* istanbul ignore next */
const internalServerError = res => {
  res.writeHead(500);
  res.end();
};

/* istanbul ignore next */
const readAndServe = (res, asset, IfNoneMatch/*, IfModifiedSince*/) => {
  readFile(asset + '.json', (err, data) => {
    if (err)
      internalServerError(res);
    else
      serveFile(res, asset, parse(data), IfNoneMatch);
  });
};

/* istanbul ignore next */
const serveFile = (res, asset, headers, IfNoneMatch/*, IfModifiedSince*/) => {
  const {ETag, ['Last-Modified']: LastModified} = headers;
  if (ETag === IfNoneMatch/* && LastModified === IfModifiedSince*/) {
    res.writeHead(304, headers);
    res.end();
  }
  else {
    res.writeHead(
      200,
      asset.slice(-12) === '/favicon.ico' ?
        {
          'Content-Length': headers['Content-Length'],
          'Content-Type': 'image/vnd.microsoft.icon',
          'Last-Modified': LastModified
        } :
        headers
    );
    createReadStream(asset).pipe(res);
  }
};

/* istanbul ignore next */
export default ({source, dest, headers}) => {
  const SOURCE = resolve(source);
  const DEST = dest ? resolve(dest) : join(tmpdir(), 'ucompress-cdn');
  const options = {createFiles: true, headers};
  return (req, res, next) => {
    const path = req.url.replace(/\?.*$/, '');
    const original = resolve(SOURCE + path);
    stat(original, (err, stats) => {
      if (err || !stats.isFile()) {
        if (next)
          next();
        else {
          res.writeHead(404);
          res.end();
        }
      }
      else {
        let asset = resolve(DEST + path);
        const {
          ['accept-encoding']: AcceptEncoding,
          ['if-none-match']: IfNoneMatch,
          // ['if-modified-since']: IfModifiedSince,
        } = req.headers;
        if (compressed.has(extname(path).toLowerCase())) {
          switch (true) {
            case /\bbr\b/.test(AcceptEncoding):
              asset += '.br';
              break;
            case /\bgzip\b/.test(AcceptEncoding):
              asset += '.gzip';
              break;
            case /\bdeflate\b/.test(AcceptEncoding):
              asset += '.deflate';
              break;
          }
        }
        readFile(asset + '.json', (err, data) => {
          if (err) {
            const compress = resolve(DEST + path);
            const waitForIt = compress + '.wait';
            mkdir(dirname(compress), {recursive: true}, err => {
              if (err)
                internalServerError(res);
              // flag the creation of files so this can work with cluster too
              else if (existsSync(waitForIt))
                watchFile(waitForIt, () => {
                  unwatchFile(waitForIt);
                  readAndServe(res, asset, IfNoneMatch);
                });
              else {
                try {
                  writeFileSync(waitForIt, path);
                  auto(original, compress, options)
                    .then(
                      () => {
                        unlink(waitForIt, err => {
                          if (err)
                            internalServerError(res);
                          else
                            readAndServe(res, asset, IfNoneMatch);
                        });
                      },
                      () => unlink(waitForIt, () => internalServerError(res))
                    );
                }
                catch (o_O) {
                  internalServerError(res);
                }
              }
            });
          }
          else
            serveFile(res, asset, parse(data), IfNoneMatch);
        });
      }
    });
  };
};
