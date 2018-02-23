import postcss from "postcss";

function guttersProp(decl, webComponents) {
	const childSelector = " > *";
	const originalRule = decl.parent;
	const slottedSelector = " > ::slotted(*)";
	const levelTwoRule = postcss.rule({selector: originalRule.selector + childSelector});
	const levelTwoSlotted = postcss.rule({selector: originalRule.selector + slottedSelector});


	const percentage = decl.value.match(/[\d\.]+%/g);
	console.log(webComponents, percentage);

	// Add new rules
	originalRule.before(levelTwoRule);

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
		originalRule.append(
			`--parent-gutters: initial;
			 --per-gutters: calc(100% / ((100 - ${number}) / ${number})) !important;
			 --margin: calc(var(--per-parent-gutters, 0px) - var(--per-gutters, 0px)) !important;
			 padding-top: 0.02px;
			 margin-top: var(--margin);
			 margin-left: var(--margin);`
		);
	}

	else {
		originalRule.append(
			`--parent-gutters: initial;
			 --gutters: ${decl.value} !important;
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
			 --per-parent-gutters: calc(100% / ((100 - ${number}) / ${number})) !important;
			 --per-gutters: initial;
			 --diff-gutters: calc(var(--gutters, 0px) - var(--parent-gutters, 0px));
			 --margin: var(--parent-gutters, 0px);
			 margin-top: var(--margin);
			 margin-left: var(--margin);`
		);
	}
	else {
		levelTwoRule.append(
			`--parent-gutters: ${decl.value} !important;
			 --gutters: initial;
			 --neg-gutters: calc(-1 * var(--gutters, 0px)) !important;
			 --diff-gutters: calc(var(--gutters, 0px) - var(--parent-gutters, 0px));
			 --margin: var(--parent-gutters, 0px);
			 margin-top: var(--margin);
			 margin-left: var(--margin);`
		);
	}





	if (webComponents) {
		levelTwoSlotted.append(
			`--parent-gutters: ${decl.value} !important;
			 --gutters: initial;
			 --neg-gutters: calc(var(--gutters, 0px) - var(--child-gutters, 0px)) !important;
			 --margin: var(--parent-gutters, 0px);
			 margin-top: var(--margin);
			 margin-left: var(--margin);`
		);
	}

	originalRule.walk(i => { i.raws.before = "\n\t" });
	levelTwoRule.walk(i => { i.raws.before = "\n\t" });
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
			${prop}: calc(${decl.value} + var(--diff-gutters, 0px));`
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
			`${prop}: calc(${decl.value} + var(--gutters, 0px))`
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
