import postcss from "postcss";

export default postcss.plugin("postcss-gutters", () => {
	// opts = opts || {};

	function width(decl) {
		// var hasGutters = false;
		// var selector = decl.parent.selector;
		// var isChild = selector.match(/ *> *\*$/);
		// if (isChild) {
		// 	selector = selector.replace(/ *> *\*$/g, "");
        //
		// 	var regex = "(" + selector + ")$";
        //
		// 	const selectorMatch = new RegExp(regex);
		// 	css.walkRules(selectorMatch, rule => {
		// 		rule.walkDecls("gutters", () => {
		// 			hasGutters = true;
		// 		});
		// 	});
		// }

		// var rule = decl.parent;
        //
		// rule.walkDecls("gutters", () => {
		// 	hasGutters = true;
		// });
		// console.log(rule);
		// if (hasGutters === false) {
		// 	decl.before({
		// 		prop: "width",
		// 		value: "calc(" + decl.value + " - var(--IGI, calc(-1 * var(--AGI))))"
		// 	});
		// } else {
		// 	decl.before({
		// 		prop: "width",
		// 		value: "calc(" + decl.value + " - var(--IGI, 0px) + var(--AGI))"
		// 	});
		// }

		decl.before({
			prop: "width",
			value: "calc(" + decl.value + " - var(--IGI, calc(-1 * var(--AGI))))"
		});

		decl.remove();
	}

	function gutters(decl) {
		var values = postcss.list.space(decl.value);
		var rule = decl.parent;


		if (values.length === 1) {
			decl.before({
				prop: "--AGB",
				value: values[0]
			});
			decl.before({
				prop: "--AGI",
				value: values[0]
			});
		} else {
			decl.before({
				prop: "--AGB",
				value: values[0]
			});
			decl.before({
				prop: "--AGI",
				value: values[1]
			});
		}
		// The calulation for negative margins needs to be changed? to support gutters on nested elements. It needs to calulate remaining space taking higher up element from lower down elemen.

		decl.before({
			prop: "margin-right",
			value: "calc((-1 * var(--IGI, var(--AGI))) + var(--AMI, 0px)) !important"
		});
		decl.before({
			prop: "margin-top",
			value: "calc((-1 * var(--IGB, var(--AGB))) + var(--AMB, 0px)) !important"
		});

		var newRule = postcss.rule({
			selector: rule.selector + " > *"
		});

		if (values.length === 1) {
			newRule.append(
				{
					prop: "--IGB",
					value: values[0]
				},
				{
					prop: "--IGI",
					value: values[0]
				},
				{
					prop: "--AMB",
					value: "calc(var(--IGB) - (var(--AGB, 0px) - var(--IGB, 0px)))"
				},
				{
					prop: "--AMI",
					value: "calc(var(--IGI) - (var(--AGI, 0px) - var(--IGI, 0px)))"
				}
			);
		}
		else {
			newRule.append(
				{
					prop: "--IGB",
					value: values[0]
				},
				{
					prop: "--IGI",
					value: values[1]
				},
				{
					prop: "--AMB",
					value: "calc(var(--IGB) - (var(--AGB, 0px) - var(--IGB, 0px)))"
				},
				{
					prop: "--AMI",
					value: "calc(var(--IGI) - (var(--AGI, 0px) - var(--IGI, 0px)))"
				}
			);
		}

		newRule.append(
			{
				prop: "margin-right",
				value: "var(--AMI)"
			},
			{
				prop: "margin-top",
				value: "var(--AMB)"
			}
		);

		rule.after(newRule);

		// decl.remove(); >> Need to change code so that an anonymous function is used for callback in width() so that gutters() can accept it and only complete when width() is done.
	}

	return function(css) {
		// const propertyMatch = new RegExp(`^(guttering)`)

		css.walkDecls(decl => {
			if (decl.prop === "width") {
				width(decl);
			}
			if (decl.prop === "gutters") {
				gutters(decl);
			}
		});
	};
});
