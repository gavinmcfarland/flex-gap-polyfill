import postcss from "postcss";

export default postcss.plugin("postcss-gutters", () => {
	// opts = opts || {};


	function transformWidth(decl) {
		let level1Rule = decl.parent;
		let isPercentage = decl.value.match(/[\d\.]+%/g);
		let level2Rule = postcss.rule({
			selector: level1Rule.selector + " > *"
		});
		var valueNumber = 0;

		if (decl.value === "collapse") {
			decl.before({
				prop: "flex-grow",
				value: "0"
			});
			decl.before({
				prop: "display",
				value: "inline-flex"
			});
			decl.before({
				prop: "--width-grow",
				value: "0"
			});
			level2Rule.append({
				prop: "--width-grow",
				value: "initial"
			});
		}
		else {
			if (isPercentage) {
				valueNumber = decl.value.replace(/\%/g, "");
				// .w_50
				decl.before({
					prop: "--width",
					value: valueNumber / 100
				});

				// .w_50 > *
				level2Rule.append({
					prop: "--width",
					value: "initial"
				});

				level1Rule.before(level2Rule);
			}

			decl.before({
				prop: "--width-grow",
				value: "0"
			});
			level2Rule.append({
				prop: "--width-grow",
				value: "initial"
			});
			decl.before({
				prop: "flex-grow",
				value: "var(--row-grow, var(--height-grow, 1))"
			});
			decl.before({
				prop: "flex-shrink",
				value: "0"
			});
			decl.before({
				prop: "flex-basis",
				value: "auto !important"
			});

			decl.before({
				prop: "width",
				value: "calc(" + decl.value + " + var(--neg-gutters, var(--gutters, 0px)) - var(--p-gutters, 0px))"
			});



			// Remove original decl

		}
		decl.remove();

	}

	function transformHeight(decl) {
		let level1Rule = decl.parent;
		let isPercentage = decl.value.match(/[\d\.]+%/g);
		let level2Rule = postcss.rule({
			selector: level1Rule.selector + " > *"
		});
		var valueNumber = 0;

		if (decl.value === "collapse") {
			decl.before({
				prop: "flex-grow",
				value: "0"
			});
			decl.before({
				prop: "display",
				value: "inline-flex"
			});
		}
		else {
			if (isPercentage) {
				valueNumber = decl.value.replace(/\%/g, "");
				// .w_50
				decl.before({
					prop: "--height",
					value: valueNumber / 100
				});

				// .w_50 > *
				level2Rule.append({
					prop: "--height",
					value: "initial"
				});

				level1Rule.before(level2Rule);
			}

			decl.before({
				prop: "--height-grow",
				value: "0"
			});
			level2Rule.append({
				prop: "--height-grow",
				value: "initial"
			});
			decl.before({
				prop: "flex-grow",
				value: "var(--column-grow, var(--width-grow, 1))"
			});
			decl.before({
				prop: "flex-shrink",
				value: "0"
			});
			decl.before({
				prop: "flex-basis",
				value: "auto !important"
			});

			decl.before({
				prop: "height",
				value: "calc(" + decl.value + " + var(--neg-gutters, var(--gutters, 0px)) - var(--p-gutters, 0px))"
			});



			// Remove original decl

		}
		decl.remove();

	}

	function transformGutters(decl) {
		// var values = postcss.list.space(decl.value);
		var isPercentage = decl.value.match(/[\d\.]+%/g);
		var level1Rule = decl.parent;
		var level2Rule = postcss.rule({
			selector: level1Rule.selector + " > *"
		});
		var level2Slotted = postcss.rule({
			selector: level1Rule.selector + " > ::slotted(*)"
		});
		var level3Rule = postcss.rule({
			selector: level1Rule.selector + " > * > *"
		});
		var margin1Rule = postcss.rule({
			selector: level1Rule.selector
		});
		var margin2Rule = postcss.rule({
			selector: level1Rule.selector + " > *"
		});
		var margin2Slotted = postcss.rule({
			selector: level1Rule.selector + " > ::slotted(*)"
		});
		var beforeRule = postcss.rule({
			selector: level1Rule.selector + ":before"
		});
		var afterRule = postcss.rule({
			selector: level1Rule.selector + ":after"
		});

		// .g_20 > * > *
		level3Rule.append({
			prop: "--child-gutters",
			value: "initial"
		}, {
			prop: "--parent-gutters",
			value: "initial"
		}, {
			prop: "--neg-gutters",
			value: "initial"
		});

		// .g_20 > *
		level2Rule.append({
			prop: "--gutters",
			value: "initial"
		}, {
			prop: "--child-gutters",
			value: decl.value + "!important"
		}, {
			prop: "--parent-gutters",
			value: decl.value
		}, {
			prop: "--neg-gutters",
			value: "calc(var(--gutters, 0px) - var(--child-gutters, 0px)) !important"
		});

		level2Slotted.append({
			prop: "--gutters",
			value: "initial"
		}, {
			prop: "--child-gutters",
			value: decl.value + "!important"
		}, {
			prop: "--parent-gutters",
			value: decl.value
		}, {
			prop: "--neg-gutters",
			value: "calc(var(--gutters, 0px) - var(--child-gutters, 0px)) !important"
		});

		// P-gutters
		if (isPercentage) {
			level2Rule.append({
				prop: "--p-gutters",
				value: "initial !important"
			});

			level2Slotted.append({
				prop: "--p-gutters",
				value: "initial !important"
			});

			level1Rule.append({
				prop: "--p-gutters",
				value: "calc(var(--width) * var(--gutters))"
			});
		}

		// .g_20
		decl.before({
			prop: "--gutters",
			value: decl.value + "!important"
		});

		// .g_20 > *
		margin2Rule.append({
			prop: "margin-top",
			value: "var(--child-gutters, 0px)"
		}, {
			prop: "margin-left",
			value: "var(--child-gutters, 0px)"
		});
		margin2Slotted.append({
			prop: "margin-top",
			value: "var(--child-gutters, 0px)"
		}, {
			prop: "margin-left",
			value: "var(--child-gutters, 0px)"
		});

		// .g_20
		margin1Rule.append({
			prop: "margin-top",
			value: "calc(var(--parent-gutters, 0px) - var(--p-gutters, var(--gutters, 0px))) !important"
		}, {
			prop: "margin-left",
			value: "calc(var(--parent-gutters, 0px) - var(--p-gutters, var(--gutters, 0px))) !important"
		});

		// Before, After
		beforeRule.append({
			prop: "content",
			value: "' '"
		},{
			prop: "display",
			value: "table"
		},{
			prop: "width",
			value: "0"
		});

		afterRule.append({
			prop: "content",
			value: "' '"
		},{
			prop: "display",
			value: "table"
		},{
			prop: "width",
			value: "0"
		});

		level1Rule.before(level2Rule);
		level1Rule.before(level2Slotted);
		level2Rule.before(level3Rule);
		level1Rule.before(beforeRule);
		level1Rule.before(afterRule);
		level1Rule.after(margin2Rule);
		level1Rule.after(margin2Slotted);
		margin2Rule.after(margin1Rule);

		// Remove original decl
		decl.remove();


	}

	// function width(decl) {
	// 	// var hasGutters = false;
	// 	// var selector = decl.parent.selector;
	// 	// var isChild = selector.match(/ *> *\*$/);
	// 	// if (isChild) {
	// 	// 	selector = selector.replace(/ *> *\*$/g, "");
	// 	//
	// 	// 	var regex = "(" + selector + ")$";
	// 	//
	// 	// 	const selectorMatch = new RegExp(regex);
	// 	// 	css.walkRules(selectorMatch, rule => {
	// 	// 		rule.walkDecls("gutters", () => {
	// 	// 			hasGutters = true;
	// 	// 		});
	// 	// 	});
	// 	// }
    //
	// 	var rule = decl.parent;
	// 	//
	// 	// rule.walkDecls("gutters", () => {
	// 	// 	hasGutters = true;
	// 	// });
	// 	// console.log(rule);
	// 	// if (hasGutters === false) {
	// 	// 	decl.before({
	// 	// 		prop: "width",
	// 	// 		value: "calc(" + decl.value + " - var(--IGI, calc(-1 * var(--AGI))))"
	// 	// 	});
	// 	// } else {
	// 	// 	decl.before({
	// 	// 		prop: "width",
	// 	// 		value: "calc(" + decl.value + " - var(--IGI, 0px) + var(--AGI))"
	// 	// 	});
	// 	// }
	// 	var newValue = decl.value.replace(/\%/g, "");
	// 	decl.before({
	// 		prop: "--IW",
	// 		value: newValue / 100
	// 	});
	// 	decl.before({
	// 		prop: "width",
	// 		value: "calc( " + decl.value + " - var(--CCC, var(--IGI, calc(-1 * var(--AGI, 0px)))) )"
	// 	});
    //
	// 	var anotherRule = postcss.rule({
	// 		selector: rule.selector + " > *"
	// 	});
    //
	// 	anotherRule.append({
	// 		prop: "--IW",
	// 		value: "200%"
	// 	});
    //
	// 	rule.before(anotherRule);
    //
	// 	decl.remove();
	// }

	// function gutters(decl) {
	// 	var values = postcss.list.space(decl.value);
	// 	var rule = decl.parent;
    //
	// 	if (values.length === 1) {
	// 		if (values[0].match(/[\d\.]+%/g)) {
	// 			// var newValue = values[0].replace(/\%/g, "");
	// 			decl.before({
	// 				prop: "--OAGB",
	// 				value: decl.value
    //
	// 			});
	// 			decl.before({
	// 				prop: "--OAGI",
	// 				value: decl.value
    //
	// 			});
	// 			decl.before({
	// 				prop: "--AGB",
	// 				value: "calc( " + values[0] + " * var(--IW) )"
	// 			});
	// 			decl.before({
	// 				prop: "--AGI",
	// 				value: "calc( " + values[0] + " * var(--IW) )"
	// 			});
	// 		}
	// 		else {
	// 			decl.before({
	// 				prop: "--AGB",
	// 				value: values[0]
	// 			});
	// 			decl.before({
	// 				prop: "--AGI",
	// 				value: values[0]
	// 			});
	// 		}
	// 	} else {
	// 		decl.before({
	// 			prop: "--AGB",
	// 			value: values[0]
	// 		});
	// 		decl.before({
	// 			prop: "--AGI",
	// 			value: values[1]
	// 		});
	// 	}
	// 	if (values[0].match(/[\d\.]+%/g)) {
	// 		decl.before({
	// 			prop: "margin-left",
	// 			value: "calc(   var(--AGI) - var(--IGI, var(--OAGI))    ) !important"
	// 		});
	// 		decl.before({
	// 			prop: "margin-top",
	// 			value: "calc(   var(--AGI) - var(--IGI, var(--OAGI))    ) !important"
	// 		});
	// 	}
	// 	else {
	// 		decl.before({
	// 			prop: "margin-left",
	// 			value: "calc((-1 * var(--IGI, var(--AGI))) + var(--AMI, 0px)) !important"
	// 		});
	// 		decl.before({
	// 			prop: "margin-top",
	// 			value: "calc((-1 * var(--IGB, var(--AGB))) + var(--AMB, 0px)) !important"
	// 		});
	// 	}
	// 	// The calulation for negative margins needs to be changed? to support gutters on nested elements. It needs to calulate remaining space taking higher up element from lower down elemen.
    //
    //
	// 	var newRule = postcss.rule({
	// 		selector: rule.selector + " > *"
	// 	});
    //
	// 	if (values.length === 1) {
	// 		newRule.append({
	// 			prop: "--IGB",
	// 			value: values[0]
	// 		}, {
	// 			prop: "--IGI",
	// 			value: values[0]
	// 		});
	// 		if (values[0].match(/[\d\.]+%/g)) {
	// 			newRule.append({
	// 				prop: "--AMB",
	// 				value: "var(--IGB, 0px)"
	// 			}, {
	// 				prop: "--AMI",
	// 				value: "var(--IGI, 0px)"
	// 			});
	// 		}
	// 		else {
	// 			newRule.append({
	// 				prop: "--AMB",
	// 				value: "calc(var(--IGB) - (var(--AGB, 0px) - var(--IGB, 0px)))"
	// 			}, {
	// 				prop: "--AMI",
	// 				value: "calc(var(--IGI) - (var(--AGI, 0px) - var(--IGI, 0px)))"
	// 			});
	// 		}
    //
	// 	} else {
	// 		newRule.append({
	// 			prop: "--IGB",
	// 			value: values[0]
	// 		}, {
	// 			prop: "--IGI",
	// 			value: values[1]
	// 		}, {
	// 			prop: "--AMB",
	// 			value: "calc(var(--IGB) - (var(--AGB, 0px) - var(--IGB, 0px)))"
	// 		}, {
	// 			prop: "--AMI",
	// 			value: "calc(var(--IGI) - (var(--AGI, 0px) - var(--IGI, 0px)))"
	// 		});
	// 	}
    //
    //
	// 	newRule.append({
	// 		prop: "margin-left",
	// 		value: "var(--AMI)"
	// 	}, {
	// 		prop: "margin-top",
	// 		value: "var(--AMB)"
	// 	});
    //
	// 	rule.after(newRule);
    //
    //
    //
	// 	var cZero = postcss.rule({
	// 		selector: rule.selector + " > * > *"
	// 	});
    //
	// 	cZero.append({
	// 		prop: "--CCC",
	// 		value: "0px"
	// 	});
    //
    //
    //
    //
    //
	// 	var cInitial = postcss.rule({
	// 		selector: rule.selector + " > *"
	// 	});
    //
	// 	cInitial.append(
	// 		{
	// 			prop: "--CCC",
	// 			value: "initial !important"
	// 		}
	// 	);
    //
    //
	// 	newRule.after(cZero);
	// 	cZero.after(cInitial);
    //
	// 	// decl.remove(); >> Need to change code so that an anonymous function is used for callback in width() so that gutters() can accept it and only complete when width() is done.
	// }

	return function (css) {
		// const propertyMatch = new RegExp(`^(guttering)`)

		css.walkDecls(function (decl) {
			if (decl.prop === "width") {
				transformWidth(decl);
			}
			if (decl.prop === "height") {
				transformHeight(decl);
			}
			if (decl.prop === "gutters") {
				transformGutters(decl);
			}
		});
	};
});
