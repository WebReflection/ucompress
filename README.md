# <em>µ</em>compress

[![Build Status](https://travis-ci.com/WebReflection/ucompress.svg?branch=master)](https://travis-ci.com/WebReflection/ucompress) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/ucompress/badge.svg?branch=master)](https://coveralls.io/github/WebReflection/ucompress?branch=master)


![compressed umbrellas](./test/ucompress.jpg)

<sup>**Social Media Photo by [Kevin Borrill](https://unsplash.com/@kev2480) on [Unsplash](https://unsplash.com/)**</sup>

A <em>micro</em>, all-in-one, compressor for common Web files, resolving automatically _JavaScript_ imports, when these are static.

```js
import ucompress from 'ucompress';
// const ucompress = require('ucompress');

// automatic extension => compression
ucompress(source, dest).then(dest => console.log(dest));

// explicit compression
ucompress.html(source, dest).then(dest => console.log(dest));

// handy fallback
ucompress.copy(source, dest).then(dest => console.log(dest));
```


### Compressions

  * **css** files via [csso](https://www.npmjs.com/package/csso)
  * **gif** files via [gifsicle](https://www.npmjs.com/package/gifsicle)
  * **html** files via [html-minifier](https://www.npmjs.com/package/html-minifier)
  * **jpg** or **jpeg** files via [jpegtran-bin](https://www.npmjs.com/package/jpegtran-bin)
  * **js** or **mjs** files via [uglify-es](https://www.npmjs.com/package/uglify-es)
  * **png** files via [pngquant-bin](https://www.npmjs.com/package/pngquant-bin)
  * **svg** files via [svgo](https://www.npmjs.com/package/svgo)
  * **xml** files via [html-minifier](https://www.npmjs.com/package/html-minifier)


### Options

The optional third `options` _object_ parameter can contain any of the following properties:

  * `createFile`, a _boolean_ property, `false` by default, that will automatically pre-compress via _brotli_, _gzip_, and _deflate_, compatible files, plus it will create a `.json` file with pre-processed _headers_ details per each file
  * `maxWidth`, an _integer_ property, that if provided, it will reduce, if necessary, the destination image _width_ when it comes to _JPG_ or _PNG_ files
  * `maxHeight`, an _integer_ property, that if provided, it will reduce, if necessary, the destination image _height_ when it comes to _JPG_ or _PNG_ files
  * `preview`, a _boolean_ parameter, false by default, that creates _JPG_ counter `.preview.jpg` files to be served instead of originals, enabling bandwidth saving, especially for very big pictures
  * `noMinify`, a _boolean_ parameter, false by default, that keeps the `.js`, `.css`, and `.html` source intact, still performing other changes, such as `.js` imports


#### About `ucompress.createHeaders(path[, headers])`

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
  * **.json**
  * **.md**
  * **.svg**
  * **.txt**
  * **.woff2**
  * **.xml**
  * **.yml**

Incompatible files will fallback as regular copy `source` into `dest` when the module is used as callback, without creating any optimized version, still providing headers when the flag is used.


### As Micro CDN

If you'd like to use this module to serve files _CDN_ like, check **[µcdn](https://github.com/WebReflection/ucdn#readme)** out!


### As binary file

Due dependencies, it's recommended to install this module via `npm i -g ucompress`, however you can try it via `npx` too.

Run `npx ucompress --help` to see options.
