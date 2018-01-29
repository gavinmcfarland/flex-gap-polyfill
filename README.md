# PostCSS Gutters

[![NPM Version][npm-img]][npm-url]
[![Linux Build Status][cli-img]][cli-url]
[![Windows Build Status][win-img]][win-url]
[![Gitter Chat][git-img]][git-url]

Work in progress, not recommended for production.

Apply gutters between child elements of any parent element.

Example:

```css
.parent {
    gutters: 20px;
}

```

It works by adding margins to each child element and recalculating their widths. 

- Works with nested elements
- Use with or without a wrapper div
- Gutters don't have to be even numbers
- Works well with responsive design
- Works with percentages at first level (nested coming soon)


## Setup

```bash
npm install postcss-gutters --save-dev
```


[npm-url]: https://www.npmjs.com/package/postcss-gutters
[npm-img]: https://img.shields.io/npm/v/postcss-gutters.svg
[cli-url]: https://travis-ci.org/mindthetic/postcss-gutters
[cli-img]: https://img.shields.io/travis/mindthetic/postcss-gutters.svg
[win-url]: https://ci.appveyor.com/project/mindthetic/postcss-gutters
[win-img]: https://img.shields.io/appveyor/ci/mindthetic/postcss-gutters.svg
[git-url]: https://gitter.im/postcss/postcss
[git-img]: https://img.shields.io/badge/chat-gitter-blue.svg

[PostCSS]: https://github.com/postcss/postcss
