# PostCSS Gap Polyfill

[![NPM Version][npm-img]][npm-url]
[![Linux Build Status][cli-img]][cli-url]
[![Windows Build Status][win-img]][win-url]
[![Gitter Chat][git-img]][git-url]


A polyfill for adding gap between flex items, following the CSS Gap specification.

> 🙋 Looking for people to help test.

Example:

```css
.container {
    display: flex;
    gap: 40px;
}

```

Output:

```css
/* Output simplified for example */

.container > * {
    --gutters_parent: 40px !important;
    --gutters_item: 40px !important;
    --gutters: var(--gutters_item) !important;
    margin-top: var(--gutters);
    margin-left: var(--gutters);
}

.container {
    --gutters_container: calc(var(--gutters_parent, 0px) - 40px) !important;
    --gutters: var(--gutters_container);
    margin-top: var(--gutters);
    margin-left: var(--gutters);
}
```

You can view [several examples](https://mindthetic.github.io/postcss-gutters/) of it in action.

It works by adding margins to each child element and recalculating their widths and applying a negative margin to the container.

- Works with unlimited nested elements
- No additional class names or divs needed
- Use with or without a wrapper div (support for margins coming soon)
- Works well with responsive design
- Gutters don't have to be even numbers
- Style borders and padding as normal
- Partial support for percentages (tempermental)

## Setup

```bash
npm install postcss-gap-polyfill --save-dev
```

## Browsers

Supports all current modern browsers, Edge, Firefox, Chrome, Safari, Opera.


[npm-url]: https://www.npmjs.com/package/postcss-gutters
[npm-img]: https://img.shields.io/npm/v/postcss-gutters.svg
[cli-url]: https://travis-ci.org/limitlessloop/postcss-gutters
[cli-img]: https://img.shields.io/travis/limitlessloop/postcss-gutters.svg
[win-url]: https://ci.appveyor.com/project/limitlessloop/postcss-gutters
[win-img]: https://img.shields.io/appveyor/ci/limitlessloop/postcss-gutters.svg
[git-url]: https://gitter.im/postcss/postcss
[git-img]: https://img.shields.io/badge/chat-gitter-blue.svg

[PostCSS]: https://github.com/postcss/postcss
