# PostCSS Gutters

[![NPM Version][npm-img]][npm-url]
[![Linux Build Status][cli-img]][cli-url]
[![Windows Build Status][win-img]][win-url]
[![Gitter Chat][git-img]][git-url]

A [PostCSS] plugin which lets you add gutters between child elements of any parent element.

- Works with nested elements
- Use with or without a wrapper div
- Gutters don't have to be even numbers
- Works well with responsive design

## Usage
Example:

```css
.parent {
    gutters: 20px;
}

```

Outputs:

```css
.parent {
    --PGY: 20px;
    --PGX: 20px;
    margin-right: calc(var(--CGY, 0px) - var(--PGX, 0px));
    margin-bottom: calc(var(--CGY, 0px) - var(--PGX, 0px));
    width: calc(400px - var(--CGX, 0px) + var(--PGX));
}

.parent > * {
    --CGY: 20px;
    --CGX: 20px;
    margin-right: var(--CGY, 0px);
    margin-bottom: var(--CGX, 0px);
}
```

## Setup

```bash
npm install postcss-gutters --save-dev
```


[npm-url]: https://www.npmjs.com/package/postcss-negative-padding
[npm-img]: https://img.shields.io/npm/v/postcss-negative-padding.svg
[cli-url]: https://travis-ci.org/mindthetic/postcss-negative-padding
[cli-img]: https://img.shields.io/travis/mindthetic/postcss-negative-padding.svg
[win-url]: https://ci.appveyor.com/project/mindthetic/postcss-negative-padding
[win-img]: https://img.shields.io/appveyor/ci/mindthetic/postcss-negative-padding.svg
[git-url]: https://gitter.im/postcss/postcss
[git-img]: https://img.shields.io/badge/chat-gitter-blue.svg

[PostCSS]: https://github.com/postcss/postcss
