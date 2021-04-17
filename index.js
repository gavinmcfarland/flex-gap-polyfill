function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var postcss = _interopDefault(require('postcss'));

const {
  parse
} = require('postcss-values-parser');

const pf = "--fgp-";

function hasFlex(decl, obj) {
  if (decl.prop === "display") {
    const container = decl.parent;
    const item = postcss.rule({
      selector: `${container.selector} > *`
    });

    if (decl.value === "flex" || decl.value === "inline-flex") {
      container.before(item);
      container.append(`${pf}has-polyfil_gap-container: initial;`);
      item.append(`${pf}has-polyfil_gap-item: initial;`);
    }

    item.walk(i => {
      i.raws.before = "\n\t";
    });
  }

  if (decl.prop === "display" && decl.value === "flex") {
    obj.hasFlex = true;
  }

  if (decl.prop === "display" && decl.value === "inline-flex") {
    obj.hasFlex = true;
  }
}

function addGap(rule, values, marginValues, opts) {
  const container = rule;
  const item = postcss.rule({
    selector: `${container.selector} > *`
  });
  const reset = postcss.rule({
    selector: `${container.selector} > * > *`
  });
  const slotted = postcss.rule({
    selector: `${container.selector} > ::slotted(*)`
  });
  container.before(item);
  item.before(reset);
  const properties = [["_row", "top"], ["_column", "left"]];
  properties.forEach((property, index) => {
    var axis = property[0];
    var side = property[1];
    var value = values[index];

    if (value === "0") {
      value = "0px";
    }

    var number = parse(value).nodes[0].value;
    var unit = parse(value).nodes[0].unit;
    var percentageRowGaps = opts.percentageRowGaps || unit != "%" && axis === "_row"; // Percentages

    if (unit === "%") {
      // formula: (parent - self) / (100 - self) * 100
      if (percentageRowGaps && axis === "_row" || axis === "_column") {
        container.append(`${pf}gap_percentage-decimal${axis}: ${number / 100};
				${pf}gap_container${axis}: var(${pf}has-polyfil_gap-container, var(${pf}gap_percentage-to-pixels${axis}, calc( ((var(${pf}gap_parent${axis}, 0%) - ${value}) * var(${pf}width_percentages-decimal, 1)) / (100 - ${number}) * 100))) !important;`);
      } else {
        container.append(`${pf}gap_container${axis}: var(--fgp-gap_item_row) !important;`);
      }
    } // Pixels, Ems
    else {
        // formula: (parent - self)
        container.append(`${pf}gap_container${axis}: var(${pf}has-polyfil_gap-container, calc(var(${pf}gap_parent${axis}, 0px) - ${value})) !important;`);
      }

    reset.append(`${pf}gap_item${axis}: initial;`);
    item.append(`pointer-events: all;
			${pf}gap_container${axis}: initial;
			${pf}gap_item${axis}: var(${pf}has-polyfil_gap-item, ${value}) !important;
			${pf}gap${axis}: var(${pf}gap_item${axis});`);

    if (percentageRowGaps && axis === "_row" || axis === "_column") {
      item.append(`${pf}gap_parent${axis}: var(${pf}has-polyfil_gap-item, ${value}) !important;
					margin-${side}: var(${pf}gap${axis});`);
    }

    container.append(`pointer-events: none;
			${pf}gap_parent${axis}: initial;
			${pf}gap_item${axis}: initial;
			${pf}gap${axis}: var(${pf}gap_container${axis}) !important;
			padding-top: 0.02px;`);

    if (percentageRowGaps && axis === "_row" || axis === "_column") {
      // Moved !important to from margin property to custom property. Not sure if this breaks anything
      container.append(`${pf}margin-${side}: calc(var(${pf}gap${axis}) + ${marginValues[0]}) !important;
					margin-${side}: var(${pf}margin-${side});`);
    } // If web components


    if (opts.webComponents === true) {
      container.before(slotted);
      slotted.append(`${pf}gap_parent${axis}: ${value};
				${pf}gap_item${axis}: ${value};
				${pf}gap${axis}: var(${pf}gap_item${axis});`);

      if (percentageRowGaps && axis === "_row" || axis === "_column") {
        slotted.append(`margin-${side}: var(${pf}gap${axis}) !important;`);
      }
    } // container.append(
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
      decl.remove();
    }
  });
}

function addWidth(decl) {
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
      const container = decl.parent;
      const reset = postcss.rule({
        selector: `${container.selector} > *`
      });
      container.before(reset);
      let axis = prop === "width" ? "_column" : "_row"; // Percentages

      if (value.unit === "%") {
        container.append(`${pf}${prop}_percentages-decimal: ${value.number / 100} !important;`);
        reset.append(`${pf}${prop}_percentages-decimal: initial;`);
      } // Pixels, Ems
      else {
          container.append(`${pf}gap_percentage-to-pixels_column: calc(-1 * ${decl.value} * var(${pf}gap_percentage-decimal${axis})) !important;
			${pf}gap_percentage-to-pixels_row: calc(-1 * ${decl.value} * var(${pf}gap_percentage-decimal${axis})) !important;`);
          container.append(`${pf}${prop}: calc(${decl.value} - var(${pf}gap_container${axis}, 0%)) !important;`);
          reset.append(`${pf}gap_percentage-to-pixels_column: initial;
			${pf}gap_percentage-to-pixels_row: initial;`);
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
    rootRule.append(`${pf}has-polyfil_gap-container: 0px;
			${pf}has-polyfil_gap-item: 0px;`);
    rootRule.walk(i => {
      i.raws.before = "\n\t";
    });
  }
}

module.exports = (opts = {}) => {
  opts = opts || {};
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
          addWidth(decl);
          hasFlex(decl, obj);
          hasGap(decl, obj);
          hasMargin(decl, obj);
        });

        if (obj.hasGap && obj.hasFlex) {
          addGap(rule, obj.gapValues, obj.marginValues, opts);
          removeGap(rule);
        }
      });
    }

  };
};

module.exports.postcss = true;
//# sourceMappingURL=index.js.map
