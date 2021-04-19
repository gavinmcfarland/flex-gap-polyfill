import postcss from 'postcss';

const {
  parse
} = require('postcss-values-parser'); // var twMarginRegex = /^.-?m(y-[0-9]|x-[0-9]|-px|-[0-9].?[0-9]?)/gmi


module.exports = (opts = {}) => {
  opts = opts || {};
  const pf = "--fgp-";
  const flexGapNotSupported = opts.flexGapNotSupported ? opts.flexGapNotSupported + " " : "";

  function getFlex(decl, obj) {
    if (decl.prop === "display" && decl.value === "flex" || decl.prop === "display" && decl.value === "inline-flex") {
      obj.hasFlex = true;
    }
  }

  function getWidth(decl, obj) {
    if (decl.prop === "width") {
      obj.hasWidth = true;
    }

    if (decl.prop === "height") {
      obj.hasHeight = true;
    }
  }

  function getGap(decl, obj) {
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

  function getMargin(decl, obj) {
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
  } // TODO: Try moving this function to walking decls


  function getRules(decl, obj, root) {
    var fileName = root.source.input.file;
    obj.rules.orig = decl.parent;
    var selector; // These are needed to specifiy global scope for CSS modules

    var cssModule = "";
    var cssModuleEnd = "";

    if (fileName && fileName.endsWith(".module.css") && opts.flexGapNotSupported) {
      cssModule = ":global(";
      cssModuleEnd = ") ";
    } // if (obj.hasGap && obj.hasFlex) {


    selector = {
      container: `${cssModule}${flexGapNotSupported}${cssModuleEnd}${obj.rules.orig.selector}`,
      item: `${cssModule}${flexGapNotSupported}${cssModuleEnd}${obj.rules.orig.selector} > *`,
      reset: `${cssModule}${flexGapNotSupported}${cssModuleEnd}${obj.rules.orig.selector} > * > *`,
      slotted: `${cssModule}${flexGapNotSupported}${cssModuleEnd}${obj.rules.orig.selector} > ::slotted(*)`
    }; // }

    if (opts.tailwindCSS && /^.gap(?=\b|[0-9])/gmi.test(obj.rules.orig.selector) && !obj.hasFlex || obj.hasWidth || obj.hasHeight || opts.tailwindCSS && /^.-?m(y-[0-9]|x-[0-9]|-px|-[0-9].?[0-9]?)/gmi.test(obj.rules.orig.selector) && !obj.hasFlex) {
      selector = {
        container: `${cssModule}${flexGapNotSupported}${cssModuleEnd}.flex${obj.rules.orig.selector}, ${cssModule}${flexGapNotSupported}${cssModuleEnd}.inline-flex${obj.rules.orig.selector}`,
        item: `${cssModule}${flexGapNotSupported}${cssModuleEnd}.flex${obj.rules.orig.selector} > *, ${cssModule}${flexGapNotSupported}${cssModuleEnd}.inline-flex${obj.rules.orig.selector} > *`,
        reset: `${cssModule}${flexGapNotSupported}${cssModuleEnd}.flex${obj.rules.orig.selector} > * > *, ${cssModule}${flexGapNotSupported}${cssModuleEnd}.inline-flex${obj.rules.orig.selector} > * > *`,
        slotted: `${cssModule}${flexGapNotSupported}${cssModuleEnd}.flex${obj.rules.orig.selector} > ::slotted(*), ${cssModule}${flexGapNotSupported}${cssModuleEnd}.inline-flex${obj.rules.orig.selector} > ::slotted(*)`
      };
    }

    obj.rules.container = postcss.rule({
      selector: selector.container
    });
    obj.rules.item = postcss.rule({
      selector: selector.item
    });
    obj.rules.reset = postcss.rule({
      selector: selector.reset
    });
    obj.rules.slotted = postcss.rule({
      selector: selector.slotted
    });
  }

  function addRootSelector(root) {
    var fileName = root.source.input.file; // This avoids adding :root selector to module files used by Next.js

    if (!(fileName && fileName.endsWith(".module.css"))) {
      const rootRule = postcss.rule({
        selector: ":root"
      });
      root.prepend(rootRule);
      rootRule.append(`${pf}has-polyfill-gap-container: 0px;
			${pf}has-polyfill-gap-item: 0px;`);
      rootRule.walk(i => {
        i.raws.before = "\n\t";
      });
    }
  }

  function addWidth(rule, obj) {
    function ifUnit(value) {
      var regex = /^calc\(|([0-9|.]+px|cm|mm|in|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)$/;
      return regex.test(value);
    }

    if (obj.hasWidth || obj.hasHeight) {
      rule.walkDecls(decl => {
        var value = parse(decl.value).nodes[0];
        let prop = decl.prop;

        if (decl.value === 0) {
          decl.value = "0px";
        }

        if (ifUnit(decl.value)) {
          const origContainer = obj.rules.orig;
          const container = obj.rules.container;
          const reset = obj.rules.reset;
          origContainer.after(container);
          container.before(reset);
          let axis = prop === "width" ? "column" : "row"; // Percentages

          if (value.unit === "%") {
            container.append(`${pf}${prop}-percentages-decimal: ${value.number / 100} !important;`);
            reset.append(`${pf}${prop}-percentages-decimal: initial;`);
          } // Pixels, Ems
          else {
              container.append(`${pf}gap-percentage-to-pixels-column: calc(-1 * ${decl.value} * var(${pf}gap_percentage-decimal-${axis})) !important;
			${pf}gap-percentage-to-pixels-row: calc(-1 * ${decl.value} * var(${pf}gap-percentage-decimal-${axis})) !important;`);
              container.append(`${pf}${prop}: calc(${decl.value} - var(${pf}gap-container-${axis}, 0%)) !important;`);
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
      });
    }
  }

  function addFlex(rule, obj) {
    // if (obj.hasFlex) {
    const origContainer = obj.rules.orig;
    const container = obj.rules.container;
    const item = obj.rules.item;
    origContainer.after(container);
    container.before(item);
    container.append(`${pf}has-polyfill-gap-container: initial;`);
    item.append(`${pf}has-polyfill-gap-item: initial;`);
    item.walk(i => {
      i.raws.before = "\n\t";
    }); // }
  }

  function addGap(rule, obj, opts) {
    const origContainer = obj.rules.orig;
    const container = obj.rules.container;
    const item = obj.rules.item;
    const reset = obj.rules.reset;
    const slotted = obj.rules.slotted;
    const properties = [["row", "top"], ["column", "left"]];
    origContainer.after(container);
    container.before(item);
    item.before(reset); // Just a precaution incase flex gap detection has false positive

    if (opts.flexGapNotSupported) {
      container.append(`gap: 0;`);
    }

    properties.forEach((property, index) => {
      var axis = property[0];
      var side = property[1];
      var value = obj.gapValues[index];

      if (value === "0") {
        value = "0px";
      }

      var number = parse(value).nodes[0].value;
      var unit = parse(value).nodes[0].unit;
      var percentageRowGaps = opts.percentageRowGaps || unit != "%" && axis === "row"; // Percentages

      if (unit === "%") {
        // formula: (parent - self) / (100 - self) * 100
        if (percentageRowGaps && axis === "row" || axis === "column") {
          container.append(`${pf}gap-percentage-decimal-${axis}: ${number / 100};
				${pf}gap-container-${axis}: var(${pf}has-polyfill-gap-container, var(${pf}gap-percentage-to-pixels-${axis}, calc( ((var(${pf}gap-parent-${axis}, 0%) - ${value}) * var(${pf}width-percentages-decimal, 1)) / (100 - ${number}) * 100))) !important;`);
        } else {
          container.append(`${pf}gap-container-${axis}: var(--fgp-gap-item-row) !important;`);
        }
      } // Pixels, Ems
      else {
          // formula: (parent - self)
          container.append(`${pf}gap-container-${axis}: var(${pf}has-polyfill-gap-container, calc(var(${pf}gap-parent-${axis}, 0px) - ${value})) !important;`);
        }

      reset.append(`${pf}gap-item-${axis}: initial;`);
      item.append(`${pf}gap-container-${axis}: initial;
			${pf}gap-item-${axis}: var(${pf}has-polyfill-gap-item, ${value}) !important;
			${pf}gap-${axis}: var(${pf}gap-item-${axis});`);

      if (percentageRowGaps && axis === "row" || axis === "column") {
        item.append(`${pf}gap-parent-${axis}: var(${pf}has-polyfill-gap-item, ${value}) !important;
					margin-${side}: var(${pf}gap-${axis});`);
      }

      container.append(`${pf}gap-parent-${axis}: initial;
			${pf}gap-item-${axis}: initial;
			${pf}gap-${axis}: var(${pf}gap-container-${axis}) !important;`);

      if (percentageRowGaps && axis === "row" || axis === "column") {
        // Needed to switch margin values depending on row/top or column/left marginValues => [top, left] // may need changing to [top, right, bottom, left]?
        var axisNumber = axis === "row" ? 0 : 1; // Moved !important to from margin property to custom property. Not sure if this breaks anything

        container.append(`${pf}margin-${side}: calc(var(${pf}gap-${axis}) + ${obj.marginValues[axisNumber]}) !important;
					margin-${side}: var(${pf}margin-${side});`);
      } // If web components


      if (opts.webComponents === true) {
        container.before(slotted);
        slotted.append(`${pf}gap-parent-${axis}: ${value};
				${pf}gap-item-${axis}: ${value};
				${pf}gap-${axis}: var(${pf}gap-item-${axis});`);

        if (percentageRowGaps && axis === "row" || axis === "column") {
          slotted.append(`margin-${side}: var(${pf}gap-${axis}) !important;`);
        }
      }
    });
    item.append(`pointer-events: all;`);
    container.append(`pointer-events: none;
		padding-top: 0.02px;`);
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

  function addMargin(rule, obj) {
    // Rewrites margin properties for:
    // margin: 1em; => margin: calc() 1em calc();
    // margin-top: 1em; => margin-top: calc();
    // margin-left: 1em; => margin-left: calc();
    function ifUnit(value) {
      var regex = /^calc\(|([0-9|.]+px|cm|mm|in|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)$/;
      return regex.test(value);
    }

    const origContainer = obj.rules.orig;
    const container = obj.rules.container;

    if (opts.tailwindCSS && /^.-?m(y-[0-9]|x-[0-9]|-px|-[0-9].?[0-9]?)/gmi.test(obj.rules.orig?.selector)) {
      rule.walkDecls(decl => {
        if (ifUnit(decl.value)) {
          origContainer.after(container);

          if (decl.prop === "margin") {
            container.append(`margin: calc(var(${pf}gap-row) + ${obj.marginValues[0]}) ${obj.marginValues[1]} calc(var(${pf}gap-column) + ${obj.marginValues[0]})`);
          }

          if (decl.prop === "margin-top") {
            container.append(`margin-top: calc(var(${pf}gap-row) + ${obj.marginValues[0]})`);
          }

          if (decl.prop === "margin-left") {
            container.append(`margin-left: calc(var(${pf}gap-column) + ${obj.marginValues[1]})`);
          } // let axis = prop === "width" ? "column" : "row";


          container.walk(i => {
            i.raws.before = "\n\t";
          });
        }
      });
    }
  }

  function removeGap(rule) {
    rule.walkDecls(decl => {
      if (decl.prop === "gap" || decl.prop === "column-gap" || decl.prop === "row-gap") {
        // FIXME: Prevent gap from being deletec in certain scenarios // Thing this is working?
        if (!(opts.flexGapNotSupported || opts.tailwindCSS && /^.gap(?=\b|[0-9])/gmi.test(rule.selector))) {
          decl.remove();
        }
      }
    });
  }

  return {
    postcssPlugin: 'postcss-gap',

    Once(root) {
      addRootSelector(root);
      root.walkRules(rule => {
        var obj = {
          rules: {},
          gapValues: ['0px', '0px'],
          marginValues: ['0px', '0px'],
          hasGap: false,
          hasFlex: false
        };
        rule.walkDecls(decl => {
          getFlex(decl, obj);
          getGap(decl, obj);
          getMargin(decl, obj);
          getWidth(decl, obj);
          getRules(decl, obj, root);
        });
        addWidth(rule, obj);
        addMargin(rule, obj);

        if (obj.hasGap && obj.hasFlex || opts.tailwindCSS && /^.gap(?=\b|[0-9])/gmi.test(rule.selector) && !obj.hasFlex) {
          addFlex(rule, obj);
          addGap(rule, obj, opts);
          removeGap(rule);
        }
      });
    }

  };
};

module.exports.postcss = true;
//# sourceMappingURL=index.mjs.map
