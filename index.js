import postcss from "postcss";

export default postcss.plugin("postcss-guttering", () => {
	// opts = opts || {};

	function width(decl) {
		var hasGutters = false;
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

		var rule = decl.parent;

		rule.walkDecls("gutters", () => {
			hasGutters = true;
		});

		if (hasGutters === false) {
			decl.before({
				prop: "width",
				value: "calc(" + decl.value + " - var(--CGX, 0px))"
			});
		} else {
			decl.before({
				prop: "width",
				value: "calc(" + decl.value + " - var(--CGX, 0px) + var(--PGX))"
			});
		}

		decl.remove();
	}

	function gutters(decl) {
		var values = postcss.list.space(decl.value);
		var rule = decl.parent;


		if (values.length === 1) {
			decl.before({
				prop: "--PGY",
				value: values[0]
			});
			decl.before({
				prop: "--PGX",
				value: values[0]
			});
		} else {
			decl.before({
				prop: "--PGY",
				value: values[0]
			});
			decl.before({
				prop: "--PGX",
				value: values[1]
			});
		}
		// The calulation for negative margins needs to be changed? to support gutters on nested elements. It needs to calulate remaining space taking higher up element from lower down elemen.

		decl.before({
			prop: "margin-right",
			value: "calc(var(--CGY, 0px) - var(--PGX, 0px))"
		});
		decl.before({
			prop: "margin-bottom",
			value: "calc(var(--CGY, 0px) - var(--PGX, 0px))"
		});

		var newRule = postcss.rule({
			selector: rule.selector + " > *"
		});

		if (values.length === 1) {
			newRule.append(
				{
					prop: "--CGY",
					value: values[0]
				},
				{
					prop: "--CGX",
					value: values[0]
				}
			);
		}
		else {
			newRule.append(
				{
					prop: "--CGY",
					value: values[0]
				},
				{
					prop: "--CGX",
					value: values[1]
				}
			);
		}

		newRule.append(
			{
				prop: "margin-right",
				value: "var(--CGY, 0px)"
			},
			{
				prop: "margin-bottom",
				value: "var(--CGX, 0px)"
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
