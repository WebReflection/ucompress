# <em>µ</em>compress

[![Build Status](https://travis-ci.com/WebReflection/ucompress.svg?branch=master)](https://travis-ci.com/WebReflection/ucompress) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/ucompress/badge.svg?branch=master)](https://coveralls.io/github/WebReflection/ucompress?branch=master)

A <em>micro</em>, all-in-one, compressor for common Web files.

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
  * **js** files via [uglify-es](https://www.npmjs.com/package/uglify-es)
  * **png** files via [pngquant-bin](https://www.npmjs.com/package/pngquant-bin)
  * **svg** files via [svgo](https://www.npmjs.com/package/svgo)

Each file will automatically generate its own related `.json` file which includes a [RFC-7232](https://tools.ietf.org/html/rfc7232) compliant _ETag_, among other details such as `last-modified`, `content-type`, and `content-length`.

### Brotli, Deflate, and GZip

The following file extensions, available via the `ucompress.encoded` array too, will create their `.brotli`, `.deflate`, and `.gzip` version in the destination folder, plus their own `.json` file, per each different compression, **only** if the method received a third `{createFile: true}` options parameter.

  * **.css**
  * **.html**
  * **.js**
  * **.md**
  * **.svg**
  * **.txt**
  * **.woff2**

Incompatible files will fallback as regular copy `source` into `dest` when the module is used as callback, without creating any optimized version.
