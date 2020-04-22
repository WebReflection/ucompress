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

### Brotli, Deflate, and GZip

The following kind of file extensions will automatically create their `.brotli`, `.deflate`, and `.gzip` version in the destination folder.

  * **.css**
  * **.html**
  * **.js**
  * **.md**
  * **.svg**
  * **.txt**
  * **.woff2**

Incompatible files will fallback as regular copy `source` into `dest` when the module is used as callback, without creating any optimized version.
