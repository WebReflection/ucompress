#!/usr/bin/env node

const {mkdir, readdir, stat} = require('fs');
const {basename, dirname, extname, join, resolve} = require('path');

const umap = require('umap');
const jsModules = umap(new Map);

const ucompress = require('./cjs/index.js');
const blur = require('./cjs/preview.js');

let source = '.';
let dest = '';
let headers = false;
let help = false;
let noImport = false;
let noMinify = false;
let preview = false;
let sourceMap = false;
let maxWidth, maxHeight;

for (let {argv} = process, {length} = argv, i = 2; i < length; i++) {

  // utils
  const asInt = ({$1}) => parseInt($1 ? $1.slice(1) : argv[++i], 10);
  const asString = ({$1}) => ($1 ? $1.slice(1) : argv[++i]);

  switch (true) {

    // integers
    case /^--max-width(=\d+)?$/.test(argv[i]):
      maxWidth = asInt(RegExp);
      break;
    case /^--max-height(=\d+)?$/.test(argv[i]):
      maxHeight = asInt(RegExp);
      break;

    // strings as paths
    case /^--dest(=.+)?$/.test(argv[i]):
      dest = resolve(process.cwd(), asString(RegExp));
      break;
    case /^--source(=.+)?$/.test(argv[i]):
      source = resolve(process.cwd(), asString(RegExp));
      break;

    // no value needed
    case /^--create-headers$/.test(argv[i]):
      headers = true;
      break;
    case /^--with-source-map$/.test(argv[i]):
    case /^--source-map$/.test(argv[i]):
      sourceMap = true;
      break;
    case /^--with-preview$/.test(argv[i]):
    case /^--preview$/.test(argv[i]):
      preview = true;
      break;
    case /^--no-imports?$/.test(argv[i]):
      noImport = true;
      break;
    case /^--no-minify$/.test(argv[i]):
      noMinify = true;
      break;
    case /^--help$/.test(argv[i]):
    default:
      help = true;
      i = length;
      break;
  }
}

if ((headers || preview) && !dest)
  dest = source;

if (help || !dest) {
  console.log('');
  console.log(`\x1b[1mucompress --source ./path/ --dest ./other-path/\x1b[0m`);
  console.log(`  --dest ./          \x1b[2m# destination folder where files are created\x1b[0m`);
  console.log(`  --source ./        \x1b[2m# file or folder to compress, default current folder\x1b[0m`);
  console.log(`  --max-width X      \x1b[2m# max images width in pixels\x1b[0m`);
  console.log(`  --max-height X     \x1b[2m# max images height in pixels\x1b[0m`);
  console.log(`  --create-headers   \x1b[2m# creates .json files to serve as headers\x1b[0m`);
  console.log(`  --with-preview     \x1b[2m# enables *.preview.jpeg images\x1b[0m`);
  console.log(`  --preview          \x1b[2m# alias for --with-preview\x1b[0m`);
  console.log(`  --with-source-map  \x1b[2m# generates source map\x1b[0m`);
  console.log(`  --source-map       \x1b[2m# alias for --source-map\x1b[0m`);
  console.log(`  --no-import        \x1b[2m# avoid resolving imports\x1b[0m`);
  console.log(`  --no-minify        \x1b[2m# avoid source code minification\x1b[0m`);
  console.log('');
  console.log('\x1b[1m\x1b[2mPlease note:\x1b[0m\x1b[2m if source and dest are the same, both \x1b[0m--create-headers');
  console.log('\x1b[2mand \x1b[0m--with-preview\x1b[2m, or \x1b[0m--preview\x1b[2m, will \x1b[1mnot\x1b[0m\x1b[2m compress any file.\x1b[0m');
  console.log('');
}
else {
  const error = err => {
    console.error(err);
    process.exit(1);
  };
  const samePath = dest === source;
  if (headers && samePath)
    ucompress.createHeaders(dest).catch(error);
  else if (preview && samePath) {
    const crawl = source => new Promise((res, rej) => {
      stat(source, (err, stat) => {
        /* istanbul ignore if */
        if (err)
          rej(err);
        else {
          if (stat.isFile())
            blur(source).then(res, rej);
          /* istanbul ignore else */
          else if (stat.isDirectory())
            readdir(source, (err, files) => {
              /* istanbul ignore if */
              if (err)
                rej(err);
              else
                Promise.all(files
                  .filter(file => !/^[._]/.test(file) &&
                                  /\.jpe?g$/i.test(file) &&
                                  !/\.preview\.jpe?g$/i.test(file))
                  .map(file => crawl(join(source, file)))
                ).then(res, rej);
            });
        }
      });
    });
    crawl(source).catch(error);
  }
  else {
    let jsSource = source;
    let jsDest = dest;
    let checkEntry = true;
    const crawl = (source, dest, options) => new Promise((res, rej) => {
      stat(source, (err, stat) => {
        /* istanbul ignore if */
        if (err)
          rej(err);
        else {
          if (stat.isFile()) {
            if (checkEntry) {
              checkEntry = false;
              jsSource = dirname(jsSource);
              jsDest = dirname(jsDest);
            }
            if (/\.m?js$/i.test(extname(source)))
              ucompress.js(source, dest, options, jsModules, jsSource, jsDest)
                .then(res, rej);
            else
              ucompress(source, dest, options)
                .then(res, rej);
          }
          /* istanbul ignore else */
          else if (stat.isDirectory() && basename(source) !== 'node_modules') {
            checkEntry = false;
            const onDir = err => {
              if (err)
                rej(err);
              else
                readdir(source, (err, files) => {
                  /* istanbul ignore if */
                  if (err)
                    rej(err);
                  else
                    Promise.all(files
                      .filter(file => !/^[._]/.test(file))
                      .map(file => crawl(join(source, file), join(dest, file), options))
                    ).then(res, rej);
                });
            };
            if (samePath)
              onDir(null);
            else
              mkdir(dest, {recursive: true}, onDir);
          }
          else
            res(dest);
        }
      });
    });
    crawl(
      source,
      dest,
      {
        createFiles: headers,
        maxWidth, maxHeight,
        preview, sourceMap,
        noImport, noMinify
      }
    )
      .catch(error);
  }
}
