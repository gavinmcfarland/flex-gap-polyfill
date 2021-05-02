import postcss from "postcss";
const { parse } = require('postcss-values-parser');

// var twMarginRegex = /^.-?m(y-[0-9]|x-[0-9]|-px|-[0-9].?[0-9]?)/gmi

// TODO: To support Tailwind need to cover all variants of class names including device eg md:. margin, width, flex, height

// TODO: Test with example repos
// TODO: Check webComponents option works
// TODO: Check works with tailwind

module.exports = (opts = {}) => {
	opts = opts || {}

	const pf = "fgp-";
	const flexGapNotSupported = opts.flexGapNotSupported ? opts.flexGapNotSupported + " " : "";

	function getFlex(decl, obj) {
		if (decl.prop === "display" && decl.value === "flex" || decl.prop === "display" && decl.value === "inline-flex") {
			obj.hasFlex = true;
		}
	}

	function getWidth(decl, obj) {
		if (decl.prop === "width") {
			obj.hasWidth = true
		}
		if (decl.prop === "height") {
			obj.hasHeight = true
		}
	}

	function getGap(decl, obj) {
		if (decl.prop === "gap" || decl.prop === "column-gap" || decl.prop === "row-gap") {
			obj.hasGap = true;
			if (decl.prop === "row-gap") {
				obj.gapValues[0] = decl.value
			}

			if (decl.prop === "column-gap") {
				obj.gapValues[1] = decl.value
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
			obj.hasMargin = true
			if (decl.prop === "margin-top") {
				if (decl.value === "0") {
					value = '0px'
				}
				obj.marginValues[0] = value
			}



			if (decl.prop === "margin") {
				obj.marginValues = postcss.list.space(decl.value);

				if (decl.prop === "margin-left") {
					if (decl.value === "0") {
						value = '0px'
					}
					obj.marginValues[3] = value
				}

				if (obj.marginValues[0] === "0") {
					obj.marginValues[0] = '0px'
				}

				if (obj.marginValues[1] === "0") {
					obj.marginValues[1] = '0px'
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
		var fileName = root.source.input.file
		obj.rules.orig = decl.parent

		var selector;


		// These are needed to specifiy global scope for CSS modules
		var cssModule = "";
		var cssModuleEnd = ""

		if ((fileName && fileName.endsWith(".module.css")) && opts.flexGapNotSupported) {
			cssModule = ":global("
			cssModuleEnd = ") "
		}

		// if (obj.hasGap && obj.hasFlex) {
		selector = {
			container: `${cssModule}${flexGapNotSupported}${cssModuleEnd}${obj.rules.orig.selector}`,
			item: `${cssModule}${flexGapNotSupported}${cssModuleEnd}${obj.rules.orig.selector} > *`,
			reset: `${cssModule}${flexGapNotSupported}${cssModuleEnd}${obj.rules.orig.selector} > * > *`,
			slotted: `${cssModule}${flexGapNotSupported}${cssModuleEnd}${obj.rules.orig.selector} > ::slotted(*)`
		};
		// }

		if ((opts.tailwindCSS && /^.gap(?=\b|[0-9])/gmi.test(obj.rules.orig.selector) && !obj.hasFlex) || (obj.hasWidth || obj.hasHeight) || (opts.tailwindCSS && /^.-?m(y-[0-9]|x-[0-9]|-px|-[0-9].?[0-9]?)/gmi.test(obj.rules.orig.selector) && !obj.hasFlex)) {
			selector = {
				container: `${cssModule}${flexGapNotSupported}${cssModuleEnd}.flex${obj.rules.orig.selector}, ${cssModule}${flexGapNotSupported}${cssModuleEnd}.inline-flex${obj.rules.orig.selector}`,
				item: `${cssModule}${flexGapNotSupported}${cssModuleEnd}.flex${obj.rules.orig.selector} > *, ${cssModule}${flexGapNotSupported}${cssModuleEnd}.inline-flex${obj.rules.orig.selector} > *`,
				reset: `${cssModule}${flexGapNotSupported}${cssModuleEnd}.flex${obj.rules.orig.selector} > * > *, ${cssModule}${flexGapNotSupported}${cssModuleEnd}.inline-flex${obj.rules.orig.selector} > * > *`,
				slotted: `${cssModule}${flexGapNotSupported}${cssModuleEnd}.flex${obj.rules.orig.selector} > ::slotted(*), ${cssModule}${flexGapNotSupported}${cssModuleEnd}.inline-flex${obj.rules.orig.selector} > ::slotted(*)`
			};
		}

		obj.rules.container = postcss.rule({ selector: selector.container });
		obj.rules.item = postcss.rule({ selector: selector.item });
		obj.rules.reset = postcss.rule({ selector: selector.reset });
		obj.rules.slotted = postcss.rule({ selector: selector.slotted });

		obj.rules.container.prepend(postcss.comment({ text: '-fgp' }))
		obj.rules.item.prepend(postcss.comment({ text: '-fgp' }))
		obj.rules.reset.prepend(postcss.comment({ text: '-fgp' }))
		obj.rules.slotted.prepend(postcss.comment({ text: '-fgp' }))
	}

	function addRootSelector(root) {
		var fileName = root.source.input.file

		// This avoids adding :root selector to module files used by Next.js
		if (!(fileName && fileName.endsWith(".module.css"))) {
			const rootRule = postcss.rule({ selector: ":root" });

			root.prepend(rootRule);

			rootRule.append(
				`--has-fgp: initial;
				--parent-has-fgp: initial;`
			);

			rootRule.walk(i => { i.raws.before = "\n\t"; });

		}
	}

	// function addWidth(rule, obj) {
	// 	function ifUnit(value) {
	// 		var regex = /^calc\(|([0-9|.]+px|cm|mm|in|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)$/
	// 		return regex.test(value)
	// 	}

	// 	if (obj.hasWidth || obj.hasHeight) {
	// 		rule.walkDecls((decl) => {
	// 			var value = parse(decl.value).nodes[0];
	// 			let prop = decl.prop;

	// 			if (decl.value === 0) {
	// 				decl.value = "0px";
	// 			}

	// 			if (ifUnit(decl.value)) {
	// 				const origContainer = obj.rules.orig;
	// 				const container = obj.rules.container
	// 				const reset = obj.rules.reset;

	// 				origContainer.after(container);
	// 				container.before(reset);

	// 				let axis = prop === "width" ? "column" : "row";

	// 				// Percentages
	// 				if (value.unit === "%") {
	// 					container.append(
	// 						`${pf}${prop}-percentages-decimal: ${value.number / 100} !important;`
	// 					);

	// 					reset.append(
	// 						`${pf}${prop}-percentages-decimal: initial;`
	// 					);
	// 				}

	// 				// Pixels, Ems
	// 				else {
	// 					container.append(
	// 						`${pf}gap-percentage-to-pixels-column: calc(-1 * ${decl.value} * var(${pf}gap_percentage-decimal-${axis})) !important;
	// 		${pf}gap-percentage-to-pixels-row: calc(-1 * ${decl.value} * var(${pf}gap-percentage-decimal-${axis})) !important;`
	// 					);

	// 					container.append(
	// 						`${pf}${prop}: calc(${decl.value} - var(${pf}gap-container-${axis}, 0%)) !important;`
	// 					);

	// 					reset.append(
	// 						`${pf}gap-percentage-to-pixels-column: initial;
	// 		${pf}gap-percentage-to-pixels-row: initial;`
	// 					);
	// 				}

	// 				container.walk(i => { i.raws.before = "\n\t"; });
	// 				reset.walk(i => { i.raws.before = "\n\t"; });
	// 			}
	// 		})
	// 	}
	// }

	// function addFlex(rule, obj) {
	// 	// if (obj.hasFlex) {
	// 	const origContainer = obj.rules.orig;
	// 	const container = obj.rules.container;
	// 	const item = obj.rules.item

	// 	origContainer.after(container);

	// 	container.before(item);

	// 	container.append(
	// 		`${pf}has-polyfill-gap-container: initial;`
	// 	);
	// 	item.append(
	// 		`${pf}has-polyfill-gap-item: initial;`
	// 	);

	// 	item.walk(i => { i.raws.before = "\n\t" });
	// 	// }

	// }

	function rewriteFlex(rule, obj) {

		rule.walkDecls((decl) => {
			if (decl.prop === "display" && decl.value === "flex" || decl.prop === "display" && decl.value === "inline-flex") {

				obj.rules.container.append(`--has-fgp: ;`)

				obj.rules.item.append(`--parent-has-fgp: !important;`)

				obj.rules.reset.append(`--parent-has-fgp: initial;`)

			}

		})
	}

	function rewriteMargin(rule, obj) {

		let { orig, container, item} = obj.rules

		// 1. Replace existing margin-left and margin-top
		orig.walkDecls((decl) => {
			if (decl.prop === "margin-top" || decl.prop === "margin-left") {
				// don't do this is margin is auto because cannot calc with auto
				if (decl.value !== "auto") {
					var value = decl.value;
					if (value === "0") {
						value = "0px";
					}
					decl.before(`--${pf}${decl.prop}: initial;`)
					decl.before(`--orig-${decl.prop}: ${value};`);
					decl.value = `var(--${pf}${decl.prop}, var(--orig-${decl.prop}))`

					item.append(`--orig-${decl.prop}: initial;`)
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
				decl.value = `var(--${pf}margin-top, var(--orig-margin-top)) var(--orig-margin-right) var(--orig-margin-bottom) var(--${pf}margin-left, var(--orig-margin-left))`

				item.append(`--orig-margin-top: initial;`)
				item.append(`--orig-margin-right: initial;`)
				item.append(`--orig-margin-bottom: initial;`)
				item.append(`--orig-margin-left: initial;`)
			}
		})

		// 2. Add margin when gap present
		const properties = [
			["row", "top"],
			["column", "left"]
		];

		// Disable gap when element has display flex
		// TODO: Needs modifying to work on gap shorthand
		orig.walkDecls((decl) => {
			if (decl.prop === "gap" || decl.prop === "row-gap" || decl.prop === "column-gap") {
				// don't do this is margin is auto because cannot calc with auto
				decl.before(`--${pf}${decl.prop}: var(--has-fgp, ${decl.value})`)
				decl.value = `var(--${pf}${decl.prop}, 0px)`
			}
		})

		if (obj.hasFlex || obj.hasGap) {
		container.append(`pointer-events: var(--has-fgp) none;`)
		item.append(`pointer-events: var(--parent-has-fgp) auto;`)
		}


		properties.forEach((property, index) => {
			var axis = property[0];
			var side = property[1];
			var value = obj.gapValues[index];
			var gapNumber = axis === "row" ? 0 : 1;
			var marginNumber = axis === "row" ? 0 : 3;
			if (value === "0") {
				value = "0px";
			}



			// Only add if gap is not null
			if ((obj.gapValues[gapNumber] !== null)) {


				// Don't add margin if rule already contains margin
				if (!obj.marginValues[marginNumber] && obj.marginValues[marginNumber] !== 0) {
					orig.append(`margin-${side}: var(--${pf}margin-${side}, var(--orig-margin-${side}));`)
				}


				if (parse(value).nodes[0].unit === "%") {
					var unitlessPercentage = parse(value).nodes[0].value / 100
					// formula: (parent - self) / (100 - 1 + percentageAsDecimal) * 100
					if (side !== "top") {
						container.append(
							`--${pf}gap-${axis}: ${value};
						--${pf}-parent-gap-as-decimal: ${unitlessPercentage};
						`)
						container.append(`--${pf}margin-${side}: calc(
						(var(--${pf}parent-gap-${axis}, 0px) - var(--${pf}gap-${axis}) / (100 - (1 + ${unitlessPercentage})) * 100)
						+ var(--${pf}orig-margin-${side}, 0px)
						) !important`
						);
					}

				}
				else {
					// formula: (parent - self)
					container.append(
						`--${pf}gap-${axis}: ${value};`
					)
					container.append(`--${pf}margin-${side}: var(--has-fgp) calc(var(--${pf}parent-gap-${axis}, 0px) / (1 + var(--${pf}-parent-gap-as-decimal, 0)) - var(--${pf}gap-${axis}) + var(--orig-margin-${side}, 0px)) !important;`
						);
				}

				if (parse(value).nodes[0].unit === "%") {
					if (side !== "top") {
						item.append(
							`--${pf}parent-gap-${axis}: ${value};
					--${pf}margin-${side}: var(--parent-has-fgp) calc(var(--${pf}gap-${axis}) / (1 + ${unitlessPercentage}) + var(--orig-margin-${side}, 0px));`
						)
					}
				}
				else {
					item.append(
						`--${pf}parent-gap-${axis}: ${value};
					--${pf}margin-${side}: var(--parent-has-fgp) calc(var(--${pf}gap-${axis}) + var(--orig-margin-${side}, 0px));`
					)
				}

				// Add margin to items
				item.append(`margin-${side}: var(--${pf}margin-${side});`)

				// FIXME: Needs fixing
				// if (opts.webComponents === true) {
				// 	container.before(slotted);

				// 	slotted.append(
				// 		`${pf}gap-parent-${axis}: ${value};
				// 	${pf}gap-item-${axis}: ${value};
				// 	${pf}gap-${axis}: var(${pf}gap-item-${axis});`
				// 	);
				// }

			}
		})

	}

	// function addGap(rule, obj, opts) {

	// 	const origContainer = obj.rules.orig;
	// 	const container = obj.rules.container
	// 	const item = obj.rules.item
	// 	const reset = obj.rules.reset
	// 	const slotted = obj.rules.slotted

	// 	const properties = [
	// 		["row", "top"],
	// 		["column", "left"]
	// 	];

	// 	origContainer.after(container);
	// 	container.before(item);
	// 	item.before(reset);

	// 	// Just a precaution incase flex gap detection has false positive
	// 	if (opts.flexGapNotSupported) {
	// 		container.append(
	// 			`gap: 0;`
	// 		)
	// 	}

	// 	properties.forEach((property, index) => {

	// 		var axis = property[0];
	// 		var side = property[1];

	// 		var value = obj.gapValues[index];

	// 		if (value === "0") {
	// 			value = "0px";
	// 		}

	// 		var unit = parse(value).nodes[0].unit;

	// 		var percentageRowGaps = opts.percentageRowGaps || unit != "%" && axis === "row";
	// 		var axisNumber = axis === "row" ? 0 : 1

	// 		// Percentages
	// 		if (unit === "%") {
	// 			// formula: (parent - self) / (100 - self) * 100
	// 			var unitlessPercentage = parse(value).nodes[0].value

	// 			container.append(
	// 				`--${pf}orig-margin-${side}: ${obj.marginValues[axisNumber]};
	// 				--${pf}gap-${axis}: ${value};
	// 				--${pf}margin-${side}: calc(
	// 					(var(--${pf}parent-gap-${axis}, 0px) - var(--${pf}gap-${axis}) / (100 - ${unitlessPercentage}) * 100)
	// 					+ var(--${pf}orig-margin-${side})
	// 					) !important;
	// 				margin-${side}: var(--has-display-flex) var(--${pf}margin-${side});`
	// 			);

	// 			// if ((percentageRowGaps && axis === "row") || axis === "column") {
	// 			// 	container.append(
	// 			// 		`${pf}gap-percentage-decimal-${axis}: ${number / 100};
	// 			// ${pf}gap-container-${axis}: var(${pf}has-polyfill-gap-container, var(${pf}gap-percentage-to-pixels-${axis}, calc( ((var(${pf}gap-parent-${axis}, 0%) - ${value}) * var(${pf}width-percentages-decimal, 1)) / (100 - ${number}) * 100))) !important;`
	// 			// 	);
	// 			// }
	// 			// else {
	// 			// 	container.append(
	// 			// 		`${pf}gap-container-${axis}: var(--fgp-gap-item-row) !important;`
	// 			// 	);
	// 			// }
	// 		}

	// 		// Pixels, Ems
	// 		else {
	// 			// formula: (parent - self)
	// 			container.append(
	// 				`--${pf}orig-margin-${side}: ${obj.marginValues[axisNumber]};
	// 				--${pf}gap-${axis}: ${value};
	// 				--${pf}margin-${side}: calc(var(--${pf}parent-gap-${axis}, 0px) - var(--${pf}gap-${axis}) + var(--${pf}orig-margin-${side})) !important;
	// 				margin-${side}: var(--has-display-flex) var(--${pf}margin-${side});`
	// 			);

	// 			// ${pf}gap-container-${axis}: var(${pf}has-polyfill-gap-container, calc(var(${pf}gap-parent-${axis}, 0px) - ${value})) !important;

	// 		}

	// 		// reset.append(
	// 		// 	`${pf}gap-item-${axis}: initial;`
	// 		// );

	// 		item.append(
	// 			`--${pf}parent-gap-${axis}: ${value};
	// 			--${pf}margin-${side}: var(--${pf}gap-${axis});
	// 			margin-${side}: var(--${pf}margin-${side});`
	// 		);

	// 		// ${pf}gap-container-${axis}: initial;
	// 		// ${pf}gap-item-${axis}: var(${pf}has-polyfill-gap-item, ${value}) !important;
	// 		// ${pf}gap-${axis}: var(${pf}gap-item-${axis});


	// 		if ((percentageRowGaps && axis === "row") || axis === "column") {
	// 			// item.append(
	// 			// 	`${pf}gap-parent-${axis}: var(${pf}has-polyfill-gap-item, ${value}) !important;
	// 			// 	margin-${side}: var(${pf}gap-${axis});`
	// 			// );
	// 		}

	// 		// container.append(
	// 		// 	`${pf}gap-parent-${axis}: initial;
	// 		// ${pf}gap-item-${axis}: initial;
	// 		// ${pf}gap-${axis}: var(${pf}gap-container-${axis}) !important;`
	// 		// );

	// 		// if ((percentageRowGaps && axis === "row") || axis === "column") {
	// 		// 	// Needed to switch margin values depending on row/top or column/left marginValues => [top, left] // may need changing to [top, right, bottom, left]?
	// 		// 	var axisNumber = axis === "row" ? 0 : 1
	// 		// 	// Moved !important to from margin property to custom property. Not sure if this breaks anything
	// 		// 	container.append(
	// 		// 		`${pf}margin-${side}: calc(var(${pf}gap-${axis}) + ${obj.marginValues[axisNumber]}) !important;
	// 		// 		margin-${side}: var(${pf}margin-${side});`
	// 		// 	);
	// 		// }

	// 		// If web components
	// 		if (opts.webComponents === true) {
	// 			// container.before(slotted);

	// 			// slotted.append(
	// 			// 	`${pf}gap-parent-${axis}: ${value};
	// 			// ${pf}gap-item-${axis}: ${value};
	// 			// ${pf}gap-${axis}: var(${pf}gap-item-${axis});`
	// 			// );

	// 			// if ((percentageRowGaps && axis === "row") || axis === "column") {
	// 			// 	slotted.append(
	// 			// 		`margin-${side}: var(${pf}gap-${axis}) !important;`
	// 			// 	);
	// 			// }
	// 		}

	// 	});

	// 	item.append(`pointer-events: all;`)
	// 	container.append(
	// 		`pointer-events: none;
	// 	padding-top: 0.02px;`)

	// 	container.walk(i => { i.raws.before = "\n\t" });
	// 	item.walk(i => { i.raws.before = "\n\t" });
	// 	reset.walk(i => { i.raws.before = "\n\t" });
	// 	slotted.walk(i => { i.raws.before = "\n\t" });

	// }

	// function addMargin(rule, obj) {
	// 	// Rewrites margin properties for:
	// 	// margin: 1em; => margin: calc() 1em calc();
	// 	// margin-top: 1em; => margin-top: calc();
	// 	// margin-left: 1em; => margin-left: calc();

	// 	function ifUnit(value) {
	// 		var regex = /^calc\(|([0-9|.]+px|cm|mm|in|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)$/
	// 		return regex.test(value)
	// 	}

	// 	const origContainer = obj.rules.orig;
	// 	const container = obj.rules.container

	// 	if ((opts.tailwindCSS && /^.-?m(y-[0-9]|x-[0-9]|-px|-[0-9].?[0-9]?)/gmi.test(obj.rules.orig?.selector))) {

	// 		rule.walkDecls((decl) => {

	// 			if (ifUnit(decl.value)) {


	// 				origContainer.after(container);

	// 				if (decl.prop === "margin") {
	// 					container.append(
	// 						`margin: calc(var(${pf}gap-row) + ${obj.marginValues[0]}) ${obj.marginValues[1]} calc(var(${pf}gap-column) + ${obj.marginValues[0]})`
	// 					)
	// 				}

	// 				if (decl.prop === "margin-top") {
	// 					container.append(
	// 						`margin-top: calc(var(${pf}gap-row) + ${obj.marginValues[0]})`
	// 					)
	// 				}

	// 				if (decl.prop === "margin-left") {
	// 					container.append(
	// 						`margin-left: calc(var(${pf}gap-column) + ${obj.marginValues[1]})`
	// 					)
	// 				}

	// 				// let axis = prop === "width" ? "column" : "row";

	// 				container.walk(i => { i.raws.before = "\n\t"; });
	// 			}
	// 		})
	// 	}
	// }

	// function removeGap(rule) {
	// 	rule.walkDecls((decl) => {
	// 		if (decl.prop === "gap" || decl.prop === "column-gap" || decl.prop === "row-gap") {
	// 			// FIXME: Prevent gap from being deletec in certain scenarios // Thing this is working?
	// 			if (!(opts.flexGapNotSupported || (opts.tailwindCSS && /^.gap(?=\b|[0-9])/gmi.test(rule.selector)))) {
	// 				decl.remove()
	// 			}
	// 		}
	// 	})
	// }

	return {
		postcssPlugin: 'postcss-gap',
		Once(root) {

			addRootSelector(root)

			root.walkRules(rule => {

				// To check if rule original or added by plugin
				var origRule = true;
				rule.walkDecls(decl => {
					if (decl.prop.startsWith("--fgp") || decl.prop.startsWith("--has")) {
						origRule = false;
					}
				})

				rule.walkComments(comment => {
					if (comment.text === "-fgp" || comment.text === "fgp") {
						origRule = false;
					}
				})

				var hasFgp = false;

				if (Array.isArray(opts.only) || opts.only === true) {
					hasFgp = false
				}

				if (origRule) {
					var obj = {
						rules: {},
						gapValues: [null, null],
						marginValues: [null, null, null, null],
						hasGap: false,
						hasFlex: false,
						hasMargin: false,
						hasFgp: hasFgp
					}

					rule.walkDecls((decl) => {
						getRules(decl, obj, root)
						getFlex(decl, obj);
						getGap(decl, obj)
						getMargin(decl, obj)
						getWidth(decl, obj)
					});

					if (Array.isArray(opts.only) || opts.only === true) {
						if (obj.hasFlex && obj.hasGap) {
							obj.hasFgp = true
						}
					}
					else {
						if (obj.hasFlex || obj.hasMargin || (obj.hasGap && obj.hasFlex)) {
							obj.hasFgp = true
						}
					}

					if (Array.isArray(opts.only)) {
						if (opts.only.includes(rule.selector) || opts.only.some((item) => {
							if (item instanceof RegExp) {
								return item.test(rule.selector)
							}
						})) {
							obj.hasFgp = true
						}

					}

					rule.walkComments(comment => {
						if (comment.text === "apply fgp") {
							comment.remove()
							obj.hasFgp = true;
						}
					})

					if (obj.hasFgp) {
						// addWidth(rule, obj);
						rewriteFlex(rule, obj)
						// addMargin(rule, obj)
						rewriteMargin(rule, obj)

					// if ((obj.hasGap && obj.hasFlex) || (opts.tailwindCSS && /^.gap(?=\b|[0-9])/gmi.test(rule.selector) && !obj.hasFlex)) {
					// 	// addFlex(rule, obj);
					// 	// addGap(rule, obj, opts);
					// 	// removeGap(rule);
					// }



						obj.rules.orig.before(obj.rules.container);

						obj.rules.container.before(obj.rules.item);

						if (obj.hasGap) {
							obj.rules.item.before(obj.rules.reset);
						}

						// if (obj.hasMargin && !obj.hasFlex && !obj.hasGap) {
						// 	obj.rules.orig.before(obj.rules.item);
						// }

						// Clean
						obj.rules.orig.walk(i => {
							return i.raws.before = "\n\t"
						});
						obj.rules.container.walk(i => { i.raws.before = "\n\t" });
						obj.rules.item.walk(i => { i.raws.before = "\n\t" });
						obj.rules.reset.walk(i => { i.raws.before = "\n\t" });
					}
				}
			})
		}
	}
}

module.exports.postcss = true
