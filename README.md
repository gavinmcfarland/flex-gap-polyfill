# Flex Gap Polyfill

[![NPM Version][npm-img]][npm-url]
[![Linux Build Status][cli-img]][cli-url]
[![Gitter Chat][git-img]][git-url]


A PostCSS polyfill for adding gap between flex items, following the CSS Gap specification.

## Known issues

- No way to detect browsers which support flex-gap, so polyfill is always used.
- Slight variation of percentage width of flex items (because of negative margin) mainly noticeable when using flex-wrap.
- Support for individul column/row gap coming soon.

## Example

```css
.container {
    display: flex;
    gap: 40px;
}

```

Becomes:

```css
/* Output simplified for purposes of example */

.container > * {
    --fgp-gap_parent: 40px !important;
    --fgp-gap_item: 40px !important;
    --fgp-gap: var(--fgp_item) !important;
    margin-top: var(--fgp-gap);
    margin-right: var(--fgp-gap);
}

.container {
    --fgp-gap_container: calc(var(--fgp-gap_parent, 0px) - 40px) !important;
    --fgp-gap: var(--fgp-gap_container);
    margin-top: var(--fgp-gap);
    margin-right: var(--fgp-gap);
}
```

You can view [several test cases](https://limitlessloop.github.io/flex-gap-polyfill/).

It works by adding margins to each child element and applying a negative margin to the container.

- Works with unlimited nested elements with any combination of units, px > px, px > %, % > %, etc.
- No additional class names or divs needed.
- Style borders and padding as normal.

## Browsers

Supports all current modern browsers, Edge, Firefox, Chrome, Safari, Opera.

## Usage

Add [Flex Gap Polyfill] to your project:

```bash
npm install flex-gap-polyfill --save-dev
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
[Flex Gap Polyfil]: https://github.com/limitlessloop/flex-gap-polyfill

## Options

- `webComponents`

    __Type__: Boolean __Default__: false

    When `true` polyfill will also target slotted elements

- `percentageRowGaps`

    __Type__: Boolean __Default__: false

    When `true` percentage row gaps will be calculated based on width of element (non spec).
