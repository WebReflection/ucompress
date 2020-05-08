import "./index.mjs";

import "non-existent";

import("uhtml").then(({render, html}) => {
  render(document.body, html`
    <div>
      Hello World!
    </div>
  `);
});
