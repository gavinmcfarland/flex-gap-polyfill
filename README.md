# Flex Gap Polyfill

[![NPM Version][npm-img]][npm-url]
[![Linux Build Status][cli-img]][cli-url]
[![Gitter Chat][git-img]][git-url]


This is a PostCSS plugin that emulates flex gap using margins.

## Known issues

- Polyfill is incompatible when `margin: auto` and `gap` are used together, to get around this create a wrapper which `margin: auto` is applied to.
- Slight variation from spec for widths of flex items that use percentages (because of negative margin on container), usually in most cases this is desirable anyway.

View the [demo page](https://limitlessloop.github.io/flex-gap-polyfill/) for various test cases of the polyfill in action.

## Example

```css
.container {
    display: flex;
    gap: 40px;
}

```

Becomes:

```css
/* Output simplified for purpose of example */

.container > * {
    --fgp-gap-parent: 40px !important;
    --fgp-gap-item: 40px !important;
    --fgp-gap: var(--fgp-gap-item) !important;
    margin-top: var(--fgp-gap);
    margin-left: var(--fgp-gap);
}

.container {
    --fgp-gap-container: calc(var(--fgp-gap-parent, 0px) - 40px) !important;
    --fgp-gap: var(--fgp-gap-container);
    margin-top: var(--fgp-gap);
    margin-left: var(--fgp-gap);
}
```

It works by emulating flex gap by adding margins to each child element and applying a negative margin to the container.

- Works with unlimited nested elements with any combination of units, px > px, px > %, % > %, etc.
- No additional class names or divs needed.
- Style borders and padding as normal.
- Supports `gap`, `row-gap` and `column-gap`.

## Browsers

Supports all current modern browsers, Edge, Firefox, Chrome, Safari, Opera.

## Usage

Add [Flex Gap Polyfill] to your project:

```bash
npm install flex-gap-polyfill postcss --save-dev
```

Use **Flex Gap Polyfill** to process your CSS:

```js
const flexGapPolyfill = require('flex-gap-polyfill');

flexGapPolyfill.process(YOUR_CSS /*, processOptions, pluginOptions */);
```

Or use it as a [PostCSS] plugin:

```js
const postcss = require('postcss');
const flexGapPolyfill = require('flex-gap-polyfill');

postcss([
    flexGapPolyfill(/* pluginOptions */)
]).process(YOUR_CSS /*, processOptions */);
```

[npm-url]: https://www.npmjs.com/package/flex-gap-polyfill
[npm-img]: https://img.shields.io/npm/v/flex-gap-polyfill.svg
[cli-url]: https://travis-ci.org/limitlessloop/flex-gap-polyfill
[cli-img]: https://img.shields.io/travis/limitlessloop/flex-gap-polyfill.svg
[git-url]: https://gitter.im/postcss/postcss
[git-img]: https://img.shields.io/badge/chat-gitter-blue.svg

[PostCSS]: https://github.com/postcss/postcss
[Flex Gap Polyfill]: https://github.com/limitlessloop/flex-gap-polyfill

## Options

- `flexGapNotSupported`

    __Type__: String __Default__: false

    Manually specify a selector to use when flex gap is not supported via [detection by JavaScript](https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css/flexgap.js) by adding a class, eg `flexGapNotSupported: '.flexGapNotSupported'`.

- `tailwindCSS`

    __Type__: Boolean __Default__: false

    When `true` polyfill will add extra CSS to support TailwindCSS.

- `webComponents`

    __Type__: Boolean __Default__: false

    When `true` polyfill will also target slotted elements

- `percentageRowGaps`

    __Type__: Boolean __Default__: false

    When `true` percentage row gaps will be calculated based on width of element (non spec).
