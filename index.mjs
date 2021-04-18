import postcss from 'postcss';

const {
  parse
} = require('postcss-values-parser');

module.exports = (opts = {}) => {
  opts = opts || {};
  const pf = "--fgp-";
  const flexGapNotSupported = opts.flexGapNotSupported ? opts.flexGapNotSupported + " " : ""; // TODO: Seperate original styles and polyfill styles using selector :not(.supportsFlexGap)

  function hasFlex(decl, obj) {
    function createRules() {
      if (decl.prop === "display" && decl.value === "flex") {
        obj.hasFlex = true;
      }

      if (decl.prop === "display" && decl.value === "inline-flex") {
        obj.hasFlex = true;
      }

      const origContainer = decl.parent;
      var selector = {
        container: `${flexGapNotSupported}${origContainer.selector}`,
        item: `${flexGapNotSupported}${origContainer.selector} > *`
      };

      if (opts.tailwindCSS && /^.gap(?=\b|[0-9])/gmi.test(origContainer.selector) && !obj.hasFlex) {
        selector = {
          container: `${flexGapNotSupported}.flex${origContainer.selector}, ${flexGapNotSupported}.inline-flex${origContainer.selector}`,
          item: `${flexGapNotSupported}.flex${origContainer.selector} > *, ${flexGapNotSupported}.inline-flex${origContainer.selector} > *`
        };
      }

      const container = postcss.rule({
        selector: selector.container
      });
      const item = postcss.rule({
        selector: selector.item
      });

      if (decl.value === "flex" || decl.value === "inline-flex") {
        origContainer.after(container);
        container.before(item);
        container.append(`${pf}has-polyfil-gap-container: initial;`);
        item.append(`${pf}has-polyfil-gap-item: initial;`);
      }

      item.walk(i => {
        i.raws.before = "\n\t";
      });
    }

    if (decl.prop === "display") {
      createRules();
    }
  }

  function addGap(rule, obj, opts) {
    const origContainer = rule;
    var selector = {
      container: `${flexGapNotSupported}${origContainer.selector}`,
      item: `${flexGapNotSupported}${origContainer.selector} > *`,
      reset: `${flexGapNotSupported}${origContainer.selector} > * > *`,
      slotted: `${flexGapNotSupported}${origContainer.selector} > ::slotted(*)`
    };

    if (opts.tailwindCSS && /^.gap(?=\b|[0-9])/gmi.test(rule.selector) && !obj.hasFlex) {
      selector = {
        container: `${flexGapNotSupported}.flex${origContainer.selector}, ${flexGapNotSupported}.inline-flex${origContainer.selector}`,
        item: `${flexGapNotSupported}.flex${origContainer.selector} > *, ${flexGapNotSupported}.inline-flex${origContainer.selector} > *`,
        reset: `${flexGapNotSupported}.flex${origContainer.selector} > * > *, ${flexGapNotSupported}.inline-flex${origContainer.selector} > * > *`,
        slotted: `${flexGapNotSupported}.flex${origContainer.selector} > ::slotted(*), ${flexGapNotSupported}.inline-flex${origContainer.selector} > ::slotted(*)`
      };
    }

    const container = postcss.rule({
      selector: selector.container
    });
    const item = postcss.rule({
      selector: selector.item
    });
    const reset = postcss.rule({
      selector: selector.reset
    });
    const slotted = postcss.rule({
      selector: selector.slotted
    });
    origContainer.after(container);
    container.before(item);
    item.before(reset); // Just a precaution incase flex gap detection has false positive

    if (opts.flexGapNotSupported) {
      container.append(`gap: 0;`);
    }

    const properties = [["-row", "top"], ["-column", "left"]];
    properties.forEach((property, index) => {
      var axis = property[0];
      var side = property[1];
      var value = obj.gapValues[index];

      if (value === "0") {
        value = "0px";
      }

      var number = parse(value).nodes[0].value;
      var unit = parse(value).nodes[0].unit;
      var percentageRowGaps = opts.percentageRowGaps || unit != "%" && axis === "-row"; // Percentages

      if (unit === "%") {
        // formula: (parent - self) / (100 - self) * 100
        if (percentageRowGaps && axis === "-row" || axis === "-column") {
          container.append(`${pf}gap-percentage-decimal${axis}: ${number / 100};
				${pf}gap-container${axis}: var(${pf}has-polyfil-gap-container, var(${pf}gap-percentage-to-pixels${axis}, calc( ((var(${pf}gap-parent${axis}, 0%) - ${value}) * var(${pf}width-percentages-decimal, 1)) / (100 - ${number}) * 100))) !important;`);
        } else {
          container.append(`${pf}gap-container${axis}: var(--fgp-gap-item-row) !important;`);
        }
      } // Pixels, Ems
      else {
          // formula: (parent - self)
          container.append(`${pf}gap-container${axis}: var(${pf}has-polyfil-gap-container, calc(var(${pf}gap-parent${axis}, 0px) - ${value})) !important;`);
        }

      reset.append(`${pf}gap-item${axis}: initial;`);
      item.append(`pointer-events: all;
			${pf}gap-container${axis}: initial;
			${pf}gap-item${axis}: var(${pf}has-polyfil-gap-item, ${value}) !important;
			${pf}gap${axis}: var(${pf}gap-item${axis});`);

      if (percentageRowGaps && axis === "-row" || axis === "-column") {
        item.append(`${pf}gap-parent${axis}: var(${pf}has-polyfil-gap-item, ${value}) !important;
					margin-${side}: var(${pf}gap${axis});`);
      }

      container.append(`pointer-events: none;
			${pf}gap-parent${axis}: initial;
			${pf}gap-item${axis}: initial;
			${pf}gap${axis}: var(${pf}gap-container${axis}) !important;
			padding-top: 0.02px;`);

      if (percentageRowGaps && axis === "-row" || axis === "-column") {
        // Moved !important to from margin property to custom property. Not sure if this breaks anything
        container.append(`${pf}margin-${side}: calc(var(${pf}gap${axis}) + ${obj.marginValues[0]}) !important;
					margin-${side}: var(${pf}margin-${side});`);
      } // If web components


      if (opts.webComponents === true) {
        container.before(slotted);
        slotted.append(`${pf}gap-parent${axis}: ${value};
				${pf}gap-item${axis}: ${value};
				${pf}gap${axis}: var(${pf}gap-item${axis});`);

        if (percentageRowGaps && axis === "-row" || axis === "-column") {
          slotted.append(`margin-${side}: var(${pf}gap${axis}) !important;`);
        }
      } // origContainer.append(
      // 	`width: 100%;
      // 	flex-grow: 0;`);

    });
    container.walk(i => {
      i.raws.before = "\n\t";
    });
    item.walk(i => {
      i.raws.before = "\n\t";
    });
    reset.walk(i => {
      i.raws.before = "\n\t";
    });
    slotted.walk(i => {
      i.raws.before = "\n\t";
    });
  }

  function removeGap(rule) {
    rule.walkDecls(decl => {
      if (decl.prop === "gap" || decl.prop === "column-gap" || decl.prop === "row-gap") {
        if (typeof opts.flexGapNotSupported === 'undefined' || opts.flexGapNotSupported === "") {
          // Needs to be removed if option not defined
          decl.remove();
        }
      }
    });
  }

  function addWidth(decl, obj) {
    function ifUnit(value) {
      var regex = /^calc\(|([0-9|.]+px|cm|mm|in|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)$/;
      return regex.test(value);
    }

    if (decl.prop === "width" || decl.prop === "height") {
      var value = parse(decl.value).nodes[0];
      let prop = decl.prop;

      if (decl.value === 0) {
        decl.value = "0px";
      }

      if (ifUnit(decl.value)) {
        const origContainer = decl.parent;
        var selector = {
          container: `${flexGapNotSupported}${origContainer.selector}`,
          reset: `${flexGapNotSupported}${origContainer.selector} > * > *`
        };

        if (opts.tailwindCSS && /^.gap(?=\b|[0-9])/gmi.test(origContainer.selector) && !obj.hasFlex) {
          selector = {
            container: `${flexGapNotSupported}.flex${origContainer.selector}, ${flexGapNotSupported}.inline-flex${origContainer.selector}`,
            reset: `${flexGapNotSupported}.flex${origContainer.selector} > * > *, ${flexGapNotSupported}.inline-flex${origContainer.selector} > * > *`
          };
        }

        const container = postcss.rule({
          selector: selector.container
        });
        const reset = postcss.rule({
          selector: selector.reset
        });
        origContainer.after(container);
        container.before(reset);
        let axis = prop === "width" ? "-column" : "-row"; // Percentages

        if (value.unit === "%") {
          container.append(`${pf}${prop}-percentages-decimal: ${value.number / 100} !important;`);
          reset.append(`${pf}${prop}-percentages-decimal: initial;`);
        } // Pixels, Ems
        else {
            container.append(`${pf}gap-percentage-to-pixels-column: calc(-1 * ${decl.value} * var(${pf}gap_percentage-decimal${axis})) !important;
			${pf}gap-percentage-to-pixels-row: calc(-1 * ${decl.value} * var(${pf}gap-percentage-decimal${axis})) !important;`);
            container.append(`${pf}${prop}: calc(${decl.value} - var(${pf}gap-container${axis}, 0%)) !important;`);
            reset.append(`${pf}gap-percentage-to-pixels-column: initial;
			${pf}gap-percentage-to-pixels-row: initial;`);
          }

        container.walk(i => {
          i.raws.before = "\n\t";
        });
        reset.walk(i => {
          i.raws.before = "\n\t";
        });
      }
    }
  }

  function hasGap(decl, obj) {
    if (decl.prop === "gap" || decl.prop === "column-gap" || decl.prop === "row-gap") {
      obj.hasGap = true;

      if (decl.prop === "row-gap") {
        obj.gapValues[0] = decl.value;
      }

      if (decl.prop === "column-gap") {
        obj.gapValues[1] = decl.value;
      }

      if (decl.prop === "gap") {
        obj.gapValues = postcss.list.space(decl.value);

        if (obj.gapValues.length === 1) {
          obj.gapValues.push(obj.gapValues[0]);
        }
      }
    }
  }

  function hasMargin(decl, obj) {
    if (decl.prop === "margin" || decl.prop === "margin-left" || decl.prop === "margin-top") {
      if (decl.prop === "margin-top") {
        obj.marginValues[0] = decl.value;
      }

      if (decl.prop === "margin-left") {
        obj.marginValues[1] = decl.value;
      }

      if (decl.prop === "margin") {
        obj.marginValues = postcss.list.space(decl.value);

        if (obj.marginValues.length === 1) {
          obj.marginValues.push(obj.marginValues[0]);
        }

        if (obj.marginValues.length > 1) {
          obj.marginValues = obj.marginValues.slice(0, 2);
        }
      }
    }
  }

  function addRootSelector(root) {
    var fileName = root.source.input.file; // This avoids adding :root selector to module files used by Next.js

    if (!(fileName && fileName.endsWith(".module.css"))) {
      const rootRule = postcss.rule({
        selector: ":root"
      });
      root.prepend(rootRule);
      rootRule.append(`${pf}has-polyfil-gap-container: 0px;
			${pf}has-polyfil-gap-item: 0px;`);
      rootRule.walk(i => {
        i.raws.before = "\n\t";
      });
    }
  }

  return {
    postcssPlugin: 'postcss-gap',

    Once(root) {
      addRootSelector(root);
      root.walkRules(rule => {
        var obj = {
          gapValues: ['0px', '0px'],
          marginValues: ['0px', '0px'],
          hasGap: false,
          hasFlex: false
        };
        rule.walkDecls(function (decl) {
          hasFlex(decl, obj);
          hasGap(decl, obj);
          hasMargin(decl, obj);
          addWidth(decl, obj);
        });

        if (obj.hasGap && obj.hasFlex) {
          addGap(rule, obj, opts);
          removeGap(rule);
        }

        if (opts.tailwindCSS && /^.gap(?=\b|[0-9])/gmi.test(rule.selector) && !obj.hasFlex) {
          addGap(rule, obj, opts);
          removeGap(rule);
        }
      });
    }

  };
};

module.exports.postcss = true;
//# sourceMappingURL=index.mjs.map
