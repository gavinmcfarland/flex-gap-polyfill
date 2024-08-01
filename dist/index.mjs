import postcss from 'postcss';
import { parse } from 'postcss-values-parser';

// TODO: To support Tailwind need to cover all variants of class names including device eg md:. margin, width, flex, height
// TODO: Test with example repos
// TODO: Check webComponents option works
// TODO: Check works with tailwind

module.exports = (opts = {}) => {
  opts = opts || {};
  const pf = "fgp-";
  const flexGapNotSupported = opts.flexGapNotSupported ? opts.flexGapNotSupported + " " : "";

  function getFlex(decl, obj) {
    if (decl.prop === "display" && decl.value === "flex" || decl.prop === "display" && decl.value === "inline-flex") {
      obj.hasFlex = true;
    }
  }

  function getWidth(decl, obj) {
    if (decl.prop === "width" || decl.prop === "max-width" || decl.prop === "min-width") {
      obj.hasWidth = true;
    }

    if (decl.prop === "height" || decl.prop === "max-height" || decl.prop === "min-height") {
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
      var value;
      obj.hasMargin = true;

      if (decl.prop === "margin-top") {
        if (decl.value === "0") {
          value = '0px';
        }

        obj.marginValues[0] = value;
      }

      if (decl.prop === "margin") {
        obj.marginValues = postcss.list.space(decl.value);

        if (decl.prop === "margin-left") {
          if (decl.value === "0") {
            value = '0px';
          }

          obj.marginValues[3] = value;
        }

        if (obj.marginValues[0] === "0") {
          obj.marginValues[0] = '0px';
        }

        if (obj.marginValues[1] === "0") {
          obj.marginValues[1] = '0px';
        }

        switch (obj.marginValues.length) {
          case 1:
            obj.marginValues.push(obj.marginValues[0]);
          // falls through

          case 2:
            obj.marginValues.push(obj.marginValues[0]);
          // falls through

          case 3:
            obj.marginValues.push(obj.marginValues[1]);
        }
      }
    }
  }

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
      item: `${cssModule}${flexGapNotSupported}${cssModuleEnd}${obj.rules.orig.selector.split(",").map(item => `${item} > *`).join(",")}`,
      reset: `${cssModule}${flexGapNotSupported}${cssModuleEnd}${obj.rules.orig.selector.split(",").map(item => `${item} > * > *`).join(",")}`,
      itemUniversal: `${cssModule}${cssModuleEnd}${obj.rules.orig.selector.split(",").map(item => `${item} > *`).join(",")}`
    };

    if (opts.webComponents) {
      selector.item = `${cssModule}${flexGapNotSupported}${cssModuleEnd}${obj.rules.orig.selector.split(",").map(item => `${item} > *`).join(",")},
${cssModule}${flexGapNotSupported}${cssModuleEnd}${obj.rules.orig.selector.split(",").map(item => `${item} > ::slotted(*)`).join(",")}`;
      selector.itemUniversal = `${cssModule}${cssModuleEnd}${obj.rules.orig.selector.split(",").map(item => `${item} > *`).join(",")},
		${cssModule}${flexGapNotSupported}${cssModuleEnd}${obj.rules.orig.selector.split(",").map(item => `${item} > ::slotted(*)`).join(",")}`;
    } // }
    // if ((opts.tailwindCSS && /^.gap(?=\b|[0-9])/gmi.test(obj.rules.orig.selector) && !obj.hasFlex) || (obj.hasWidth || obj.hasHeight) || (opts.tailwindCSS && /^.-?m(y-[0-9]|x-[0-9]|-px|-[0-9].?[0-9]?)/gmi.test(obj.rules.orig.selector) && !obj.hasFlex)) {
    // 	selector = {
    // 		container: `${cssModule}${flexGapNotSupported}${cssModuleEnd}.flex${obj.rules.orig.selector}, ${cssModule}${flexGapNotSupported}${cssModuleEnd}.inline-flex${obj.rules.orig.selector}`,
    // 		item: `${cssModule}${flexGapNotSupported}${cssModuleEnd}.flex${obj.rules.orig.selector} > *, ${cssModule}${flexGapNotSupported}${cssModuleEnd}.inline-flex${obj.rules.orig.selector} > *`,
    // 		reset: `${cssModule}${flexGapNotSupported}${cssModuleEnd}.flex${obj.rules.orig.selector} > * > *, ${cssModule}${flexGapNotSupported}${cssModuleEnd}.inline-flex${obj.rules.orig.selector} > * > *`,
    // 		slotted: `${cssModule}${flexGapNotSupported}${cssModuleEnd}.flex${obj.rules.orig.selector} > ::slotted(*), ${cssModule}${flexGapNotSupported}${cssModuleEnd}.inline-flex${obj.rules.orig.selector} > ::slotted(*)`
    // 	};
    // }


    obj.rules.container = postcss.rule({
      selector: selector.container
    });
    obj.rules.item = postcss.rule({
      selector: selector.item
    });
    obj.rules.itemUniversal = postcss.rule({
      selector: selector.itemUniversal
    });
    obj.rules.reset = postcss.rule({
      selector: selector.reset
    });
    obj.rules.container.prepend(postcss.comment({
      text: 'added by fgp'
    }));
    obj.rules.item.prepend(postcss.comment({
      text: 'added by fgp'
    }));
    obj.rules.itemUniversal.prepend(postcss.comment({
      text: 'added by fgp'
    }));
    obj.rules.reset.prepend(postcss.comment({
      text: 'added by fgp'
    }));
  }

  function addRootSelector(root, rule) {
    var fileName = root.source.input.file; // This avoids adding :root selector to module files used by Next.js

    if (!(fileName && (fileName.endsWith(".module.css") || fileName.endsWith(".module.scss") || fileName.endsWith(".module.sass") || fileName.endsWith(".module.pcss")))) {
      const rootRule = postcss.rule({
        selector: ":root"
      });
      rule.before(rootRule);
      rootRule.prepend(postcss.comment({
        text: 'added by fgp'
      }));
      rootRule.append(`--has-fgp: initial;
				--element-has-fgp: initial;
				--parent-has-fgp: initial;`);
      rootRule.walk(i => {
        i.raws.before = "\n\t";
      });
    }
  }

  function addWidth(rule, obj) {
    if (obj.hasWidth || obj.hasHeight) {
      rule.walkDecls(decl => {
        let prop = decl.prop; // let allowedProps = [
        // 	"width",
        // 	"height"
        // ]
        // if (allowedProps.includes(prop)) {

        if (decl.value === 0) {
          decl.value = "0px";
        }

        let {
          orig,
          container
        } = obj.rules;
        orig.before(container);
        let axis = prop === "width" ? "column" : "row";

        if (decl.prop === "width" || decl.prop === "height" || decl.prop === "max-height" || decl.prop === "min-height" || decl.prop === "max-width" || decl.prop === "min-width") {
          var value = parse(decl.value).nodes[0]; // Percentages

          if (value.unit === "%") {
            container.append(`--${pf}${prop}: var(--element-has-fgp) calc(${decl.value} + var(--${pf}gap-${axis}, 0%));`); // var precentageToDecimal = value.value / 100
            // Sort of a guess for forumla when width is a percentage
            // container.append(
            // 	`--${pf}${prop}: var(--element-has-fgp) calc((${decl.value} - ${precentageToDecimal}%) + (1.0${value.value} * var(--${pf}gap-${axis}, 0%)));`
            // );
            // container.append(
            // 	`--${pf}${prop}-percentages-decimal: ${value.number / 100} !important;`
            // );
            // reset.append(
            // 	`--${pf}${prop}-percentages-decimal: initial;`
            // );
          } else if (decl.value !== "auto") {
            container.append(`--${pf}${prop}: var(--element-has-fgp) calc(${decl.value} + var(--${pf}gap-${axis}, 0px));`); // 			container.append(
            // 				`--${pf}gap-percentage-to-pixels-column: calc(-1 * ${decl.value} * var(${pf}gap_percentage-decimal-${axis})) !important;
            // ${pf}gap-percentage-to-pixels-row: calc(-1 * ${decl.value} * var(${pf}gap-percentage-decimal-${axis})) !important;`
            // 			);
            // 			reset.append(
            // 				`--${pf}gap-percentage-to-pixels-column: initial;
            // ${pf}gap-percentage-to-pixels-row: initial;`
            // 			);
          } // If value is auto we ignore it, beacause it can't be calculated with calc


          if (decl.value !== "auto") {
            decl.value = `var(--fgp-${prop}, ${decl.value})`;
          }

          container.walk(i => {
            i.raws.before = "\n\t";
          }); // reset.walk(i => { i.raws.before = "\n\t"; });
          // decl.remove()
        } // }

      });
    }
  }

  function rewriteFlex(rule, obj) {
    rule.walkDecls(decl => {
      if (decl.prop === "display" && decl.value === "flex" || decl.prop === "display" && decl.value === "inline-flex") {
        obj.rules.container.append(`--has-fgp: ;`);
        obj.rules.container.append(`--element-has-fgp: ;`);
        obj.rules.item.append(`--parent-has-fgp: !important;`);
        obj.rules.item.append(`--element-has-fgp: initial;`);
        obj.rules.reset.append(`--parent-has-fgp: initial;`);
      }
    });
  }

  function rewriteMargin(rule, obj) {
    let {
      orig,
      container,
      item,
      reset,
      itemUniversal
    } = obj.rules; // 1. Replace existing margin-left and margin-top

    orig.walkDecls(decl => {
      if (decl.prop === "margin-top" || decl.prop === "margin-left") {
        // don't do this is margin is auto because cannot calc with auto
        if (decl.value !== "auto") {
          var value = decl.value;

          if (value === "0") {
            value = "0px";
          }

          decl.before(`--${pf}${decl.prop}: initial;`);
          decl.before(`--orig-${decl.prop}: ${value};`);
          decl.value = `var(--${pf}${decl.prop}, var(--orig-${decl.prop}))`;
          itemUniversal.append(`--orig-${decl.prop}: initial;`);
        }
      }

      if (decl.prop === "margin") {
        // TODO: Need to catch when value is auto as can't work with calc
        decl.before(`--${pf}margin-top: initial;`);
        decl.before(`--${pf}margin-left: initial;`);
        decl.before(`--orig-margin-top: ${obj.marginValues[0]};`);
        decl.before(`--orig-margin-right: ${obj.marginValues[1]};`);
        decl.before(`--orig-margin-bottom: ${obj.marginValues[2]};`);
        decl.before(`--orig-margin-left: ${obj.marginValues[3]};`);
        decl.value = `var(--${pf}margin-top, var(--orig-margin-top)) var(--orig-margin-right) var(--orig-margin-bottom) var(--${pf}margin-left, var(--orig-margin-left))`;
        itemUniversal.append(`--orig-margin-top: initial;`);
        itemUniversal.append(`--orig-margin-right: initial;`);
        itemUniversal.append(`--orig-margin-bottom: initial;`);
        itemUniversal.append(`--orig-margin-left: initial;`);
      }
    }); // 2. Add margin when gap present

    const properties = [["row", "top"], ["column", "left"]]; // Disable gap when element has display flex
    // TODO: Needs modifying to work on gap shorthand

    orig.walkDecls(decl => {
      if (decl.prop === "gap" || decl.prop === "row-gap" || decl.prop === "column-gap") {
        // don't do this is margin is auto because cannot calc with auto
        decl.before(`--${pf}${decl.prop}: var(--has-fgp, ${decl.value})`);
        decl.value = `var(--${pf}${decl.prop}, 0px)`;
      }
    });

    if (obj.hasFlex || obj.hasGap) {
      container.append(`pointer-events: var(--has-fgp) none;`);
      item.append(`pointer-events: var(--parent-has-fgp) auto;`);
    }

    properties.forEach((property, index) => {
      var axis = property[0];
      var side = property[1];
      var value = obj.gapValues[index];
      var gapNumber = axis === "row" ? 0 : 1;
      var marginNumber = axis === "row" ? 0 : 3;

      if (value === "0") {
        value = "0px";
      } // Only add if gap is not null


      if (obj.gapValues[gapNumber] !== null) {
        // Don't add margin if rule already contains margin
        if (!obj.marginValues[marginNumber] && obj.marginValues[marginNumber] !== 0) {
          orig.append(`margin-${side}: var(--${pf}margin-${side}, var(--orig-margin-${side}));`);
        }

        if (parse(value).nodes[0].unit === "%") {
          var unitlessPercentage = parse(value).nodes[0].value / 100; // formula: (parent - self) / (100 - 1 + percentageAsDecimal) * 100

          if (side !== "top") {
            container.append(`--${pf}gap-${axis}: ${value};
						--${pf}-parent-gap-as-decimal: ${unitlessPercentage};
						`);
            container.append(`--${pf}margin-${side}: calc(
						(var(--${pf}parent-gap-${axis}, 0px) - var(--${pf}gap-${axis}) / (100 - (1 + ${unitlessPercentage})) * 100)
						+ var(--${pf}orig-margin-${side}, 0px)
						) !important`);
          }
        } else {
          // formula: (parent - self)
          container.append(`--${pf}gap-${axis}: ${value};`);
          container.append(`--${pf}margin-${side}: var(--has-fgp) calc(var(--${pf}parent-gap-${axis}, 0px) / (1 + var(--${pf}-parent-gap-as-decimal, 0)) - var(--${pf}gap-${axis}) + var(--orig-margin-${side}, 0px)) !important;`);
        }

        if (parse(value).nodes[0].unit === "%") {
          if (side !== "top") {
            item.append(`--${pf}parent-gap-${axis}: ${value};
					--${pf}margin-${side}: var(--parent-has-fgp) calc(var(--${pf}gap-${axis}) / (1 + ${unitlessPercentage}) + var(--orig-margin-${side}, 0px));`);
          }
        } else {
          item.append(`--${pf}parent-gap-${axis}: ${value};
					--${pf}margin-${side}: var(--parent-has-fgp) calc(var(--${pf}gap-${axis}) + var(--orig-margin-${side}, 0px));`);
        } // Add margin to items


        item.append(`margin-${side}: var(--${pf}margin-${side});`); // // Reset fgp margins
        // reset.append(`--${pf}margin-${side}: initial`)
        // // Reset fgp parent gap

        reset.append(`--${pf}parent-gap-${axis}: initial`);
      }
    });
  }

  return {
    postcssPlugin: 'flex-gap-polyfill',

    Once(root) {
      var rootAdded = false;
      root.walkRules(rule => {
        if (rule.name !== 'import' && !rootAdded) {
          addRootSelector(root, rule);
          rootAdded = true;
        }
      });
      root.walkRules(rule => {
        // To check if rule original or added by plugin
        var origRule = true;
        rule.walkDecls(decl => {
          if (decl.prop.startsWith("--fgp") || decl.prop.startsWith("--has")) {
            origRule = false;
          }
        });
        rule.walkComments(comment => {
          if (comment.text === "added by fgp") {
            origRule = false;
          }
        });
        var shouldPolyfill = false;

        if (Array.isArray(opts.only) || opts.only === true) {
          shouldPolyfill = false;
        }

        if (origRule) {
          var obj = {
            rules: {},
            gapValues: [null, null],
            marginValues: [null, null, null, null],
            hasGap: false,
            hasFlex: false,
            hasMargin: false,
            shouldPolyfill: shouldPolyfill
          };
          rule.walkDecls(decl => {
            getRules(decl, obj, root);
            getFlex(decl, obj);
            getGap(decl, obj);
            getMargin(decl, obj);
            getWidth(decl, obj);
          });

          if (Array.isArray(opts.only) || opts.only === true) {
            if (obj.hasFlex && obj.hasGap) {
              obj.shouldPolyfill = true;
            }
          } else {
            if (obj.hasFlex || obj.hasMargin || obj.hasGap || obj.hasWidth || obj.hasHeight) {
              obj.shouldPolyfill = true;
            }
          }

          if (Array.isArray(opts.only)) {
            if (opts.only.includes(rule.selector) || opts.only.some(item => {
              if (item instanceof RegExp) {
                return item.test(rule.selector);
              }
            })) {
              obj.shouldPolyfill = true;
            }
          } // If rule contains comment /* apply fgp */ then polyfill it


          rule.walkComments(comment => {
            if (comment.text === "apply fgp") {
              comment.remove();
              obj.shouldPolyfill = true;
            }
          });

          if (obj.shouldPolyfill) {
            addWidth(rule, obj);
            rewriteFlex(rule, obj); // addMargin(rule, obj)

            rewriteMargin(rule, obj);

            if (obj.hasFlex || obj.hasGap || obj.hasMargin || !(obj.hasWidth || obj.hasHeight)) {
              if (!(obj.hasMargin && !obj.hasFlex && !obj.hasGap)) {
                obj.rules.orig.before(obj.rules.container);
                obj.rules.container.before(obj.rules.item);
                obj.rules.container.before(obj.rules.itemUniversal);
                obj.rules.item.before(obj.rules.reset);
              }

              if (obj.hasFlex) {
                obj.rules.item.before(obj.rules.reset);
              }

              if (obj.hasMargin && !obj.hasFlex && !obj.hasGap) {
                obj.rules.orig.before(obj.rules.item);
                obj.rules.orig.before(obj.rules.itemUniversal);
              } // Clean


              obj.rules.orig.walk(i => {
                return i.raws.before = "\n\t";
              });
              obj.rules.container.walk(i => {
                i.raws.before = "\n\t";
              });
              obj.rules.item.walk(i => {
                i.raws.before = "\n\t";
              });
              obj.rules.itemUniversal.walk(i => {
                i.raws.before = "\n\t";
              });
              obj.rules.reset.walk(i => {
                i.raws.before = "\n\t";
              }); // Remove empty rules created/added by plugin

              root.walkRules(rule => {
                // Check if the rule has no declarations but only comments
                const hasDeclarations = rule.nodes.some(node => node.type === 'decl');
                const hasOnlyComments = rule.nodes.every(node => node.type === 'comment' && node.text === "added by fgp");

                if (!hasDeclarations && hasOnlyComments) {
                  rule.remove();
                }
              });
            }
          }
        }
      });
    }

  };
};

module.exports.postcss = true;
//# sourceMappingURL=index.mjs.map
