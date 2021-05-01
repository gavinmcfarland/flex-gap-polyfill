# Changes to postcss-gap-polyfil

### 4.00 (1 May 2021)

- Completely refactored from the ground up
- Now supports use cases where `display: flex | inline-flex` and `gap` exist in two different classes
- Now supports margins on items as well
- More accurate calculation of percentage gaps

### 3.00 (18 Apr 2021)

- Refactored plugin with optimisations
- Added option to use with JavaScript flex gap detection
- Added option for support for TailwindCSS

### 2.2.1 (10 Mar 2020)

- Renamed and updated docs

### Older

- Added support for horizontal and vertical gutters
- Fixed issue where calculation for percentages was incorrect
- Works when nested using any mixture of gutters with pixels or percentage
- Works with percentage widths or fixed widths
