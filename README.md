# <em>µ</em>compress

[![Build Status](https://travis-ci.com/WebReflection/ucompress.svg?branch=master)](https://travis-ci.com/WebReflection/ucompress) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/ucompress/badge.svg?branch=master)](https://coveralls.io/github/WebReflection/ucompress?branch=master)


![compressed umbrellas](./test/ucompress.jpg)

<sup>**Social Media Photo by [Kevin Borrill](https://unsplash.com/@kev2480) on [Unsplash](https://unsplash.com/)**</sup>

A <em>micro</em>, all-in-one, compressor for common Web files, resolving automatically _JavaScript_ imports, when these are static.



## As CLI

Due amount of dependencies, it's recommended to install this module via `npm i -g ucompress`. However you can try it via `npx` too.

```sh
# either npm i -g ucompress once, or ...
npx ucompress --help
```

If `--source` and `--dest` parameter are passed, it will do everything automatically.

```sh
ucompress --source ./src --dest ./public
```

Check other flags for extra optimizations, such as `.json` headers files and/or `.br`, `.gzip`, and `.deflate` versions, which you can serve via NodeJS or Express, using [µcdn-utils](https://github.com/WebReflection/ucdn-utils#readme).



## As module

```js
import ucompress from 'ucompress';
// const ucompress = require('ucompress');

// define or retrieve `source` and `dest as you like

// automatic extension => compression
ucompress(source, dest).then(dest => console.log(dest));

// explicit compression
ucompress.html(source, dest).then(dest => console.log(dest));

// handy fallback
ucompress.copy(source, dest).then(dest => console.log(dest));
```


### Options

The optional third `options` _object_ parameter can contain any of the following properties:

  * `createFile`, a _boolean_ property, `false` by default, that will automatically pre-compress via _brotli_, _gzip_, and _deflate_, compatible files, plus it will create a `.json` file with pre-processed _headers_ details per each file
  * `maxWidth`, an _integer_ property, that if provided, it will reduce, if necessary, the destination image _width_ when it comes to _JPG_ or _PNG_ files
  * `maxHeight`, an _integer_ property, that if provided, it will reduce, if necessary, the destination image _height_ when it comes to _JPG_ or _PNG_ files
  * `preview`, a _boolean_ parameter, false by default, that creates _JPG_ counter `.preview.jpg` files to be served instead of originals, enabling bandwidth saving, especially for very big pictures
  * `noMinify`, a _boolean_ parameter, false by default, that keeps the `.js`, `.css`, and `.html` source intact, still performing other changes, such as `.js` imports



## As Micro CDN

If you'd like to use this module to serve files _CDN_ like, check **[µcdn](https://github.com/WebReflection/ucdn#readme)** out, it includes ucompress already, as [explained in this post](https://medium.com/@WebReflection/%C2%B5compress-goodbye-bundlers-bb66a854fc3c).


### Compressions

Following the list of tools ued to optimized various files:

  * **css** files via [csso](https://www.npmjs.com/package/csso)
  * **gif** files via [gifsicle](https://www.npmjs.com/package/gifsicle)
  * **html** files via [html-minifier](https://www.npmjs.com/package/html-minifier)
  * **jpg** or **jpeg** files via [jpegtran-bin](https://www.npmjs.com/package/jpegtran-bin) and/or [sharp](https://github.com/lovell/sharp)
  * **js** or **mjs** files via [terser](https://github.com/terser/terser) and [html-minifier](https://github.com/kangax/html-minifier)
  * **json** files are simply parsed and stringified so that white spaces get removed
  * **png** files via [pngquant-bin](https://www.npmjs.com/package/pngquant-bin)
  * **svg** files via [svgo](https://www.npmjs.com/package/svgo)
  * **xml** files via [html-minifier](https://www.npmjs.com/package/html-minifier)


### About Automatic Modules Resolution

If your modules are published as [dual-module](https://medium.com/@WebReflection/a-nodejs-dual-module-deep-dive-8f94ff56210e), or if you have a `module` field in your `package.json`, and it points at an _ESM_ compatible file, as it should, or if you have a `type` field equal to `module` and a `main` that points at an _ESM_ compatible, or if you have an `exports` field which `import` resolves to an _ESM_ compatible module, _µcompress_ will resolve that entry point automatically.

In every other case, the _import_ will be left untouched, eventually warning in console when such _import_ failed.

**Dynamic imports** are resolved in a very similar way, but composed imports will likely fail:

```js
// these work if the module is found in the source path
// as example, inside source/node_modules
import 'module-a';
import('module-b').then(...);

// these work *only* if the file is in the source path
// but not within a module, as resolved modules are not
// copied over, only known imports, eventually, are
import(`/js/${strategy}.js`);

// these will *not* work
import(condition ? 'condition-thing' : 'another-thing');
import('a' + thing + '.js');
```


### About `ucompress.createHeaders(path[, headers])`

This method creates headers for a specific file, or all files within a folder, excluding files that starts with a `.` dot, an `_` underscore, or files within a `node_modules` folder (_you know, that hole that should never fully land in production_).

```js
ucompress.createHeaders(
  // a folder with already optimized files
  '/path/static',
  // optional headers to set per folder
  {'Access-Control-Allow-Origin': '*'}
);
```


### Brotli, Deflate, GZip, and Headers

If the third, optional object, contains a `{createFile: true}` flag, each file will automatically generate its own related `.json` file which includes a [RFC-7232](https://tools.ietf.org/html/rfc7232#section-2.3.3) compliant _ETag_, among other details such as `last-modified`, `content-type`, and `content-length`.

The following file extensions, available via the `ucompress.encoded` _Set_, will also create their `.br`, `.deflate`, and `.gzip` version in the destination folder, plus their own `.json` file, per each different compression, but **only** when `{createFile: true}` is passed.

  * **.css**
  * **.html**
  * **.js**
  * **.mjs**
  * **.map**
  * **.json**
  * **.md**
  * **.svg**
  * **.txt**
  * **.woff2**
  * **.xml**
  * **.yml**

Incompatible files will fallback as regular copy `source` into `dest` when the module is used as callback, without creating any optimized version, still providing headers when the flag is used.
