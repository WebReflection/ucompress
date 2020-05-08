import {mkdir, readFile, writeFile} from 'fs';
import {platform} from 'os';
import {dirname, join, relative, resolve} from 'path';

import uglify from 'uglify-es';
import umap from 'umap';
import umeta from 'umeta';

import compressed from './compressed.js';
import compress from './compress.js';

const {require: $require} = umeta(import.meta);
const uglifyArgs = {output: {comments: /^!/}};
const isWindows = platform() === 'win32';

const minify = (source, options) => new Promise((res, rej) => {
  readFile(source, (err, data) => {
    if (err)
      rej(err);
    else {
      const content = data.toString();
      /* istanbul ignore if */
      if (options.noMinify)
        res(content);
      else {
        const {code, error} = uglify.minify(content, uglifyArgs);
        if (error)
          rej(error);
        else
          res(code);
      }
    }
  });
});

/* istanbul ignore next */
const noBackSlashes = s => isWindows ? s.replace(/\\(?!\s)/g, '/') : s;

const saveCode = (source, dest, code, options) =>
  new Promise((res, rej) => {
    mkdir(dirname(dest), {recursive: true}, err => {
      /* istanbul ignore if */
      if (err)
        rej(err);
      else {
        writeFile(dest, code, err => {
          /* istanbul ignore if */
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

compressed.add('.js');
compressed.add('.mjs');

/**
 * Create a file after minifying it via `uglify-es`.
 * @param {string} source The source JS file to minify.
 * @param {string} dest The minified destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
const JS = (
  source, dest, options = {},
  /* istanbul ignore next */ known = umap(new Map),
  initialSource = dirname(source),
  initialDest = dirname(dest)
) => known.get(dest) || known.set(dest, minify(source, options).then(
  code => {
    const re = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
    const baseSource = dirname(source);
    const baseDest = dirname(dest);
    const modules = [];
    const newCode = [];
    let i = 0, match;
    while (match = re.exec(code)) {
      const {0: whole, 1: quote, index} = match;
      const chunk = code.slice(i, index);
      const next = index + whole.length;
      let content = whole;
      newCode.push(chunk);
      /* istanbul ignore else */
      if (
        /(?:\bfrom\b|\bimport\b\(?)\s*$/.test(chunk) &&
        (!/\(\s*$/.test(chunk) || /^\s*\)/.test(code.slice(next)))
      ) {
        const module = whole.slice(1, -1);
        if (/^[a-z@][a-z0-9/._-]+$/i.test(module)) {
          try {
            const {length} = module;
            let path = $require.resolve(module, {paths: [baseSource]});
            let oldPath = path;
            do path = dirname(oldPath);
            while (
              path !== oldPath &&
              path.slice(-length) !== module &&
              (oldPath = path)
            );
            const i = path.lastIndexOf('node_modules');
            /* istanbul ignore if */
            if (i < 0)
              throw new Error('node_modules folder not found');
            const {exports: e, module: m, main, type} = $require(
              join(path, 'package.json')
            );
            /* istanbul ignore next */
            const index = (e && e.import) || m || (type === 'module' && main);
            /* istanbul ignore if */
            if (!index)
              throw new Error('no entry file found');
            const newSource = resolve(path, index);
            const newDest = resolve(initialDest, path.slice(i), index);
            modules.push(JS(
              newSource, newDest,
              options, known,
              initialSource, initialDest
            ));
            path = noBackSlashes(relative(dirname(source), newSource));
            /* istanbul ignore next */
            content = `${quote}${path[0] === '.' ? path : `./${path}`}${quote}`;
          }
          catch ({message}) {
            console.warn(`unable to import "${module}"`, message);
          }
        }
        else {
          modules.push(JS(
            resolve(baseSource, module),
            resolve(baseDest, module),
            options, known,
            initialSource, initialDest
          ));
        }
      }
      newCode.push(content);
      i = next;
    }
    newCode.push(code.slice(i));
    return Promise.all(
      modules.concat(saveCode(source, dest, newCode.join(''), options))
    ).then(
      () => dest,
      /* istanbul ignore next */
      err => Promise.reject(err)
    );
  }
));

export default JS;
