import {copyFile, readFile, writeFile} from 'fs';
import {basename} from 'path';

import html from 'html-minifier';
import marked from 'marked';

import compressed from './compressed.js';
import compress from './compress.js';
import htmlArgs from './html-minifier.js';

compressed.add('.md');

marked.setOptions({
  renderer: new marked.Renderer(),
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

/**
 * Copy a source file into a destination.
 * @param {string} source The source file to copy.
 * @param {string} dest The destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
export default (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    const {preview} = options;
    const onCopy = err => {
      if (err)
        rej(err);
      else if (options.createFiles) {
        compress(source, dest, 'text', options)
            .then(() => res(dest), rej);
      }
      else
        res(dest);
    };
    const onPreview = () => {
      /* istanbul ignore if */
      if (source === dest)
        onCopy(null);
      else
        copyFile(source, dest, onCopy);
    };
    if (preview) {
      readFile(source, (err, data) => {
        /* istanbul ignore if */
        if (err)
          rej(err);
        else {
          marked(data.toString(), (err, md) => {
            /* istanbul ignore if */
            if (err)
              rej(err);
            else {
              const htmlPreview = dest.replace(/\.md$/i, '.preview.html');
              writeFile(
                htmlPreview,
                html.minify(
                  `<!DOCTYPE html>
                  <html lang="en">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Preview: ${basename(source)}</title>
                  </head>
                  <body>${md}</body>
                  </html>`,
                  htmlArgs
                ),
                err => {
                  /* istanbul ignore if */
                  if (err)
                    rej(err);
                  /* istanbul ignore else */
                  else if (options.createFiles) {
                    compress(source, htmlPreview, 'text', options)
                      .then(() => onPreview(), rej);
                  }
                  else
                    onPreview();
                }
              );
            }
          });
        }
      });
    }
    else
      onPreview();
  });
