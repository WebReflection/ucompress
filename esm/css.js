import {readFile, writeFile} from 'fs';

import csso from 'csso';

import compressed from './compressed.js';
import compress from './compress.js';

compressed.add('.css');

/**
 * Create a file after minifying via `csso`.
 * @param {string} source The source CSS file to minify.
 * @param {string} dest The minified destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
export default (source, dest, options = {}) => new Promise((res, rej) => {
  readFile(source, (err, data) => {
    if (err)
      rej(err);
    else {
      /* istanbul ignore next */
      const {css} = options.noMinify ?
                      {css: data} :
                      csso.minify(data);
      // csso apparently has no way to detect errors
      writeFile(dest, css, err => {
        if (err)
          rej(err);
        else if (options.createFiles)
          compress(source, dest, 'text', options)
            .then(() => res(dest), rej);
        else
          res(dest);
      });
    }
  });
});
