# Info

1. Loop through each rule and get computed/resolved properties
    1. Check if rule has `display: flex | inline-flex`
    2. Get `gapValues[]` for rule
    3. Get `marginValues[]` for rule
2. Create selectors used by polyfill which vary depending on options
    1. Selectors are:
        - `orig` the original rule
        - `container` a duplicate of the original rule
        - `item` targets children of the container
        - `reset` resets children of the container
        - `slotted` slotted version of container
2. Append `--has-display-flex: ;` to all rules that have `display: flex | inline-flex`
    1. <mark>TODO:</mark> Probably need to check against resolved property rather than looping through each declartion because some declarations could be overridden
3. Append `--fgp-gap-column` and `--fgp-row` to all rules where `gapValues[] !== null`
3. Overwrite all occurances of `margin-left`, `margin-top` and `margin`
4. Add `margin-left` and `margin-top` to every rule where `gapValues[] !== null`
    1. <mark>Caution:</mark> This must apply to anything where `gapValues[] !== null` because user could dynamically add or remove `diplay: flex`
        1. Must not apply if `marginValues[] !== null`
        2. Add custom properties used by polyfill
