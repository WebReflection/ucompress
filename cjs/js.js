'use strict';
const {mkdir, readFile, writeFile} = require('fs');
const {platform} = require('os');
const {basename, dirname, join, relative, resolve} = require('path');

const mhl = require('minify-html-literals');
const {minify: terserMinify} = require('terser');
const umap = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('umap'));
const umeta = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('umeta'));

const compressed = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./compressed.js'));
const compress = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./compress.js'));
const minifyOptions = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./html-minifier.js'));

const {parse, stringify} = JSON;
const {minifyHTMLLiterals} = (mhl.default || mhl);

const {require: $require} = umeta(({url: require('url').pathToFileURL(__filename).href}));
const isWindows = /^win/i.test(platform());
const terserArgs = {output: {comments: /^!/}};

compressed.add('.js');
compressed.add('.mjs');
compressed.add('.map');

const minify = (source, {noMinify, sourceMap}) => new Promise((res, rej) => {
  readFile(source, (err, data) => {
    if (err)
      rej(err);
    else {
      const original = data.toString();
      /* istanbul ignore if */
      if (noMinify)
        res({original, code: original, map: ''});
      else {
        try {
          const mini = sourceMap ?
                        // TODO: find a way to integrate literals minification
                        {code: original} :
                        minifyHTMLLiterals(original, {minifyOptions});
          /* istanbul ignore next */
          const js = mini ? mini.code : original;
          const module = /\.mjs$/.test(source) ||
                          /\b(?:import|export)\b/.test(js);
          terserMinify(
            js,
            sourceMap ?
              {
                ...terserArgs,
                module,
                sourceMap: {
                  filename: source,
                  url: `${source}.map`
                }
              } :
              {
                ...terserArgs,
                module
              }
          )
          .then(({code, map}) => {
            res({original, code, map: sourceMap ? map : ''});
          })
          .catch(rej);
        }
        catch (error) {
          /* istanbul ignore next */
          rej(error);
        }
      }
    }
  });
});

const uModules = path => path.replace(/\bnode_modules\b/g, 'u_modules');

/* istanbul ignore next */
const noBackSlashes = s => (isWindows ? s.replace(/\\(?!\s)/g, '/') : s);

const saveCode = (source, dest, code, options) =>
  new Promise((res, rej) => {
    dest = uModules(dest);
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
  ({original, code, map}) => {
    const modules = [];
    const newCode = [];
    if (options.noImport)
      newCode.push(code);
    else {
      const baseSource = dirname(source);
      const baseDest = dirname(dest);
      const re = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
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
              /* istanbul ignore next */
              if (!path.includes(module) && /(\/|\\[^ ])/.test(module)) {
                const sep = RegExp.$1[0];
                const source = module.split(sep);
                const target = path.split(sep);
                const js = source.length;
                for (let j = 0, i = target.indexOf(source[0]); i < target.length; i++) {
                  if (j < js && target[i] !== source[j++])
                    target[i] = source[j - 1];
                }
                path = target.join(sep);
                path = [
                  path.slice(0, path.lastIndexOf('node_modules')),
                  'node_modules',
                  source[0]
                ].join(sep);
              }
              else {
                let oldPath = path;
                do path = dirname(oldPath);
                while (
                  path !== oldPath &&
                  path.slice(-length) !== module &&
                  (oldPath = path)
                );
              }
              const i = path.lastIndexOf('node_modules');
              /* istanbul ignore if */
              if (i < 0)
                throw new Error('node_modules folder not found');
              const {exports: e, module: m, main, type} = $require(
                join(path, 'package.json')
              );
              /* istanbul ignore next */
              const index = (e && (e.import || e['.'].import)) || m || (type === 'module' && main);
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
              path = uModules(
                noBackSlashes(relative(dirname(source), newSource))
              );
              /* istanbul ignore next */
              content = `${quote}${path[0] === '.' ? path : `./${path}`}${quote}`;
            }
            catch ({message}) {
              console.warn(`unable to import "${module}"`, message);
            }
          }
          /* istanbul ignore else */
          else if (!/^([a-z]+:)?\/\//i.test(module)) {
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
    }
    let smCode = newCode.join('');
    if (options.sourceMap) {
      const destSource = dest.replace(/(\.m?js)$/i, `$1.source$1`);
      const json = parse(map);
      const file = basename(dest);
      json.file = file;
      json.sources = [basename(destSource)];
      smCode = smCode.replace(source, file);
      modules.push(
        saveCode(source, `${dest}.map`, stringify(json), options),
        saveCode(source, destSource, original, options)
      );
    }
    return Promise.all(
      modules.concat(saveCode(source, dest, smCode, options))
    ).then(
      () => dest,
      /* istanbul ignore next */
      err => Promise.reject(err)
    );
  }
));

module.exports = JS;
