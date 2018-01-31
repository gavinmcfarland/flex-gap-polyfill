# PostCSS Gutters

[![NPM Version][npm-img]][npm-url]
[![Linux Build Status][cli-img]][cli-url]
[![Windows Build Status][win-img]][win-url]
[![Gitter Chat][git-img]][git-url]

Work in progress, not recommended for production.

Apply gutters between child elements of any container element.

Example:

```css
.container {
    gutters: 20px;
}

```

It works by adding margins to each child element and recalculating their widths. 

- Works with nested elements
- No additional class names or divs needed
- Use with or without a wrapper div
- Works well with responsive design
- Gutters don't have to be even numbers
- Style borders and padding as normal
- Supports percentages (Note on flex containers they behave inconsistantly amoungst browsers)


## Setup

```bash
npm install postcss-gutters --save-dev
```

## Browsers

Supports all current modern browsers, Edge, Firefox, Chrome, Safari, Opera.


[npm-url]: https://www.npmjs.com/package/postcss-gutters
[npm-img]: https://img.shields.io/npm/v/postcss-gutters.svg
[cli-url]: https://travis-ci.org/mindthetic/postcss-gutters
[cli-img]: https://img.shields.io/travis/mindthetic/postcss-gutters.svg
[win-url]: https://ci.appveyor.com/project/mindthetic/postcss-gutters
[win-img]: https://img.shields.io/appveyor/ci/mindthetic/postcss-gutters.svg
[git-url]: https://gitter.im/postcss/postcss
[git-img]: https://img.shields.io/badge/chat-gitter-blue.svg

[PostCSS]: https://github.com/postcss/postcss
