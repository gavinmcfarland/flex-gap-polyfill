# Flex Gap Polyfill

[![NPM Version][npm-img]][npm-url]
[![Linux Build Status][cli-img]][cli-url]
[![Windows Build Status][win-img]][win-url]
[![Gitter Chat][git-img]][git-url]


A PostCSS polyfill for adding gap between flex items, following the CSS Gap specification.

## Known issues

- No way to detect browsers which support flex-gap, so polyfill is always used.
- Slight variation of percentage width of flex items (because of negative margin) mainly noticeable when using flex-wrap.

## Example

```css
.container {
    display: flex;
    gap: 40px;
}

```

Becomes:

```css
/* Output simplified for example */

.container > * {
    --gap_parent: 40px !important;
    --gap_item: 40px !important;
    --gap: var(--gutters_item) !important;
    margin-top: var(--gap);
    margin-left: var(--gap);
}

.container {
    --gap_container: calc(var(--gap_parent, 0px) - 40px) !important;
    --gap: var(--gap_container);
    margin-top: var(--gap);
    margin-left: var(--gap);
}
```

You can view [several test cases](https://limitlessloop.github.io/flex-gap-polyfill/) here.

It works by adding margins to each child element and recalculating their widths and applying a negative margin to the container.

- Works with unlimited nested elements
- No additional class names or divs needed
- Use with or without a wrapper div (support for margins coming soon)
- Works well with responsive design
- Gutters don't have to be even numbers
- Style borders and padding as normal
- Partial support for percentages (tempermental/non-spec)

## Browsers

Supports all current modern browsers, Edge, Firefox, Chrome, Safari, Opera.

## Usage

Add [Flex Gap Polyfill] to your project:

```bash
npm install flex-gap-polyfill --save-dev
```

Use **PostCSS Magic Token** to process your CSS:

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
[win-url]: https://ci.appveyor.com/project/limitlessloop/flex-gap-polyfill
[win-img]: https://img.shields.io/appveyor/ci/limitlessloop/flex-gap-polyfill.svg
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
