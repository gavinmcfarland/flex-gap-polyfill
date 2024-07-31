# Flex Gap Polyfill

[![NPM Version][npm-img]][npm-url]
[![Gitter Chat][git-img]][git-url]

<!-- [![Linux Build Status][cli-img]][cli-url] -->

This is a pure CSS polyfill using PostCSS to emulate flex gap using margins.

## Known limitations

-   Must use a wrapper div when using `margin: auto` or `background`.
-   Percentage gaps aren't reliable if the container is not full width of parent container
-   Width of flex items with percentages vary slightly from spec because of negative margin on container.

View the [demo page](https://gavinmcfarland.github.io/flex-gap-polyfill/) for various test cases of the polyfill in action.

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
    --fgp-parent-gap-row: 40px;
    --fgp-parent-gap-column: 40px;
    --fgp-margin-top: calc(var(--fgp-gap-row) + var(--orig-margin-top, 0px));
    --fgp-margin-left: calc(
        var(--fgp-gap-column) + var(--orig-margin-left, 0px)
    );
    margin-top: var(--fgp-margin-top);
    margin-left: var(--fgp-margin-left);
}

.container {
    --fgp-gap: var(--has-fgp, 40px);
    --fgp-gap-row: 40px;
    --fgp-gap-column: 40px;
    --fgp-margin-top: calc(
        var(--fgp-parent-gap-row, 0px) - var(--fgp-gap-row) + var(--orig-margin-top, 0px)
    );
    --fgp-margin-left: calc(
        var(--fgp-parent-gap-column, 0px) - var(--fgp-gap-column) + var(--orig-margin-left, 0px)
    );
    display: flex;
    gap: var(--fgp-gap, 0px);
    margin-top: var(--fgp-margin-top, var(--orig-margin-top));
    margin-left: var(--fgp-margin-left, var(--orig-margin-left));
}
```

The polyfill emulates flex gap by adding margins to each child element and applying a negative margin to the container.

-   <mark>NEW</mark> Now works regardless of whether `display: flex` and `gap` are used in the same rule (see [Options](#Options) for ways to optimise)
-   Works with unlimited nested elements with any combination of units, px > px, px > %, % > %, etc
-   No additional class names or divs needed (except when using `margin: auto` or `background`)
-   Works even when margin already exists on element (inline styles not supported)
-   Style margin, borders and padding as normal
-   Supports `gap`, `row-gap` and `column-gap`

## Browser support

Supports all current modern browsers, Edge, Firefox, Chrome, Safari, Opera (any browser that supports `calc()` and `var()`).

## Usage

Add [Flex Gap Polyfill] to your project:

```bash
npm install flex-gap-polyfill postcss --save-dev
```

Use **Flex Gap Polyfill** to process your CSS:

```js
const flexGapPolyfill = require("flex-gap-polyfill");

flexGapPolyfill.process(YOUR_CSS /*, processOptions, pluginOptions */);
```

Or use it as a [PostCSS] plugin:

```js
const postcss = require("postcss");
const flexGapPolyfill = require("flex-gap-polyfill");

postcss([flexGapPolyfill(/* pluginOptions */)]).process(
    YOUR_CSS /*, processOptions */
);
```

[npm-url]: https://www.npmjs.com/package/flex-gap-polyfill
[npm-img]: https://img.shields.io/npm/v/flex-gap-polyfill.svg

<!-- [cli-url]: https://travis-ci.org/gavinmcfarland/flex-gap-polyfill -->

[cli-img]: https://img.shields.io/travis/gavinmcfarland/flex-gap-polyfill.svg
[git-url]: https://gitter.im/postcss/postcss
[git-img]: https://img.shields.io/badge/chat-gitter-blue.svg
[PostCSS]: https://github.com/postcss/postcss
[Flex Gap Polyfill]: https://github.com/gavinmcfarland/flex-gap-polyfill

## Options

-   `only`

    **Type**: Array **Default**: undefined

    When `true` polyfill will only apply when `display: flex | inline-flex` and `gap` are used in the same rule. Provide an array of selectors to match additional rules. Can be `strings` or `regexes`. Inlcude `/* apply fgp */` within a rule to manually apply the polyfill.

-   `flexGapNotSupported`

    **Type**: String **Default**: false

    Manually specify a selector to use when flex gap is not supported by [detection via JavaScript](https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css/flexgap.js), eg `flexGapNotSupported: '.flex-gap-not-supported'`.

<!-- - `tailwindCSS`

    __Type__: Boolean __Default__: false

    When `true` polyfill will add extra CSS to support TailwindCSS. -->

-   `webComponents`

    **Type**: Boolean **Default**: false

    When `true` polyfill will also target slotted elements

<!-- - `percentageRowGaps`

    __Type__: Boolean __Default__: false

    When `true` percentage row gaps will be calculated based on width of element (non spec). -->
