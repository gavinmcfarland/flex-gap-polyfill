import postcss from "postcss";

function guttersProp(decl, webComponents) {
	const childSelector = " > *";
	const originalRule = decl.parent;
	const slottedSelector = " > ::slotted(*)";
	const levelTwoRule = postcss.rule({selector: originalRule.selector + childSelector});
	const levelThreeRule = postcss.rule({selector: originalRule.selector + childSelector + childSelector});
	const levelTwoSlotted = postcss.rule({selector: originalRule.selector + slottedSelector});


	const percentage = decl.value.match(/[\d\.]+%/g);
	// console.log(webComponents, percentage);

	// Add new rules
	originalRule.before(levelTwoRule);
	levelTwoRule.before(levelThreeRule);

	if (webComponents) {
		originalRule.before(levelTwoSlotted);
	}

	// if (percentage) {
	// 	levelTwoRule.append(
	// 		`--p-gutters: initial !important;`
	// 	);
	// 	if (webComponents) {
	// 		levelTwoSlotted.append(
	// 			`--p-gutters: initial !important;`
	// 		);
	// 	}
	// 	originalRule.append(
	// 		`--p-gutters: calc(var(--width) * var(--gutters));`
	// 	);
	// }

	if (percentage) {
		let number = decl.value.replace(/\%/g, "");
		let perNumber = 1 / ((100 - number) / number);
		let perNumber2 = number / 100;
		originalRule.append(
			`--parent-gutters: initial;
			 --gutters: ${decl.value} !important;
			 --per-gutters-decimal: ${perNumber2} !important;
			 --width-per-gutters: calc(${decl.value} * var(--per-gutters-decimal, 0px));
			 --per-gutters-number: calc(100 / ((100 - ${number}) / ${number})) !important;
			 --width-gutters: calc((100% / ((100 - ${number}) / ${number})) * var(--width)) !important ;
			 --per-number: ${perNumber} !important;
			 --margin: var(--special-gutters, calc(var(--parent-gutters, 0px) - (var(--per-number, 0px) * var(--parent-gutters, 100%)))) !important;
			 padding-top: 0.02px;
			 margin-top: calc(var(--margin) * var(--width, 1));
			 margin-left: calc(var(--margin) * var(--width, 1));`
		);
	}

	else {
		originalRule.append(
			`--parent-gutters: initial;
			 --gutters: ${decl.value} !important;
			 --width-gutters: var(--parent-gutters);
			 --margin: calc(var(--parent-gutters, 0px) - var(--gutters, 0px)) !important;

			 padding-top: 0.02px;
			 margin-top: var(--margin);
			 margin-left: var(--margin);`
		);
	}

	if (percentage) {
		let number = decl.value.replace(/\%/g, "");
		levelTwoRule.append(
			`--parent-gutters: ${decl.value} !important;
			 --gutters: initial;
			 --width-gutters: initial;
			 --per-parent-gutters-number: calc(100 / ((100 - ${number}) / ${number})) !important;
			 --per-parent-gutters: calc(100% / ((100 - ${number}) / ${number})) !important;
			 --diff-gutters: calc(var(--gutters, 0px) - var(--parent-gutters, 0px));
			 --per-diff-gutters: calc(100% / ((100 - var(--diff-gutters)) / var(--diff-gutters)));
			 --special-gutters: calc(               ( (       var(--per-parent-gutters-number) - var(--per-gutters-number)       ) /          var(--per-parent-gutters-number)    ) *                var(--parent-gutters)           );
			 --margin: var(--parent-gutters, 0px);
			 --child-width-gutters: calc(-1 * var(--parent-gutters, 0px)) !important;
			 margin-top: var(--margin);
			 margin-left: var(--margin);`
		);
		levelThreeRule.append(
			`--child-width-gutters: initial;
			--special-gutters: initial`
		);
	}
	else {
		levelTwoRule.append(
			`--parent-gutters: ${decl.value} !important;
			 --gutters: initial;
			 --width-gutters: initial;
			 --neg-gutters: calc(-1 * var(--gutters, 0px)) !important;
			 --child-width-gutters: calc(-1 * var(--parent-gutters, 0px)) !important;
			 --diff-gutters: calc(var(--gutters, 0px) - var(--parent-gutters, 0px));
			 --margin: var(--parent-gutters, 0px);
			 margin-top: var(--margin);
			 margin-left: var(--margin);`
		);
		levelThreeRule.append(
			`--child-width-gutters: initial;
			--special-gutters: initial`
		);
	}





	if (webComponents) {
		levelTwoSlotted.append(
			`--parent-gutters: ${decl.value} !important;
			 --gutters: initial;
			 --neg-gutters: calc(var(--gutters, 0px) - var(--child-gutters, 0px)) !important;
			 --margin: var(--parent-gutters, 0px);
			 margin-top: var(--margin) !important;
			 margin-left: var(--margin) !important;`
		);
	}

	originalRule.walk(i => { i.raws.before = "\n\t" });
	levelTwoRule.walk(i => { i.raws.before = "\n\t" });
	levelThreeRule.walk(i => { i.raws.before = "\n\t" });
	levelTwoSlotted.walk(i => { i.raws.before = "\n\t" });

	decl.remove();

}

function gutterLengthProp(decl) {
	const childSelector = " > *";
	const originalRule = decl.parent;
	const levelTwoRule = postcss.rule({selector: originalRule.selector + childSelector});

	// Add new rules
	originalRule.before(levelTwoRule);

	let percentage = decl.value.match(/[\d\.]+%/g);
	let length = decl.value.match(/[\d\.]+\w+/g);
	let prop = decl.prop;


	if (percentage) {
		let number = decl.value.replace(/\%/g, "");
		decl.before(
			`--${prop}: ${number / 100};
			${prop}: calc(${decl.value} + var(--width-gutters, var(--child-width-gutters, var(--gutters, 0px))));`
		);
		levelTwoRule.append(
			`--${prop}: initial;`
		);
		originalRule.walk(i => {i.raws.before = "\n\t";});
		levelTwoRule.walk(i => {i.raws.before = "\n\t";});
		decl.remove();
	}
	else if (length) {
		decl.before(
			`--width-px: ${decl.value};
			${prop}: calc(${decl.value} + var(--width-per-gutters, var(--gutters, 0px)));`
		);
		originalRule.walk(i => {i.raws.before = "\n\t";});
		levelTwoRule.walk(i => {i.raws.before = "\n\t";});
		decl.remove();
	}
}

export default postcss.plugin("postcss-gutters", (opts) => {
	var webComponents = false;
	if (opts && opts.webComponents) {
		webComponents = true;
	}

	return function (css) {
		css.walkDecls(function (decl) {
			if (decl.prop === "width" || decl.prop === "height") {
				gutterLengthProp(decl);
			}
			if (decl.prop === "gutters") {
				guttersProp(decl, webComponents);
			}
		});
	};
});
