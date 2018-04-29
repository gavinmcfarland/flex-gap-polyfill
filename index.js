import postcss from "postcss";
var valueParser = require('postcss-value-parser');

const pf = "--FI_";
const CS = " > *";
const SS = " > ::slotted(*)";


function addGutters(decl, webComponents) {

	let value = valueParser.unit(decl.value);

	const container = decl.parent;
	const item = postcss.rule({selector: container.selector + CS});
	const reset = postcss.rule({selector: container.selector + CS + CS});
	const slotted = postcss.rule({selector: container.selector + SS});
	container.before(item);
	item.before(reset);

	// Percentages
	if (value.unit === "%") {

		// reset.append(
		// 	`${pf}gutters_new: initial;`
		// );

		item.append(
			`${pf}gutters_parent: ${decl.value};
			${pf}gutters_new: ${decl.value};`
		);
		// formular: (parent - self) / (100 - self) * 100
		container.append(
			`${pf}has_gutters: true;
			${pf}gutters_percentage-decimal: ${value.number / 100};
			${pf}gutters_new: var(${pf}gutters_percentage-to-pixels, calc( ((var(${pf}gutters_parent, 0%) - ${decl.value}) * var(${pf}width_percentages-decimal, 1)) / (100 - ${value.number}) * 100)) !important;`
		);

	}

	// Pixels, Ems
	else {
		// reset.append(
		// 	`${pf}gutters_new: initial;`
		// );

		item.append(
			`${pf}gutters_parent: ${decl.value};
			${pf}gutters_new: ${decl.value};`
		);

		container.append(
			`${pf}has_gutters: true;
			${pf}gutters_new: calc(var(${pf}gutters_parent, 0px) - ${decl.value}) !important;`
		);

	}

	// If web components
	if (webComponents === true) {
		container.before(slotted);

		slotted.append(
			`${pf}gutters_parent: ${decl.value};
			${pf}gutters_new: ${decl.value};
			margin-top: var(${pf}gutters_new) !important;
			margin-left: var(${pf}gutters_new) !important;`
		);
	}
	else {
		item.append(
			`margin-top: var(${pf}gutters_new);
			margin-left: var(${pf}gutters_new);`
		);

		container.append(
			`padding-top: 0.02px;
			margin-top: var(${pf}gutters_new);
			margin-left: var(${pf}gutters_new);`
		);
	}

	container.walk(i => { i.raws.before = "\n\t" });
	item.walk(i => { i.raws.before = "\n\t" });
	reset.walk(i => { i.raws.before = "\n\t" });
	slotted.walk(i => { i.raws.before = "\n\t" });


	decl.remove();
}


function addWidth(decl) {

	let value = valueParser.unit(decl.value);
	let prop = decl.prop;

	const container = decl.parent;
	const reset = postcss.rule({selector: container.selector + CS});

	container.before(reset);

	// createRules();

	// Percentages
	if (value.unit === "%") {
		container.append(
			`${pf}${prop}_percentages: ${decl.value} !important;
			${pf}${prop}_percentages-decimal: ${value.number / 100} !important;
			${pf}${prop}_new: calc(${decl.value} - var(${pf}gutters_new, 0%)) !important;`
		);

		reset.append(
			`${pf}${prop}_percentages: initial;
			${pf}${prop}_percentages-decimal: initial;
			${pf}${prop}_new: initial;`
		);
	}

	// Pixels, Ems
	else {
		container.append(
			`${pf}gutters_percentage-to-pixels: calc(${"-" + decl.value} * var(${pf}gutters_percentage-decimal)) !important;
			${pf}${prop}_pixels: ${decl.value} !important;
			${pf}${prop}_new: calc(${decl.value} - var(${pf}gutters_new, 0px)) !important;`
		);

		reset.append(
			`${pf}gutters_percentage-to-pixels: initial;
			${pf}${prop}_pixels: initial;
			${pf}${prop}_new: initial;`
		);
	}

	decl.before(
		`${prop}: var(${pf}${prop}_new);`
	);

	decl.remove();

	// cleanRules();

	container.walk(i => {i.raws.before = "\n\t";});
	reset.walk(i => {i.raws.before = "\n\t";});


}

export default postcss.plugin("postcss-gutters", (opts) => {
	var webComponents = false;
	if (opts && opts.webComponents) {
		webComponents = true;
	}

	return function (css) {
		css.walkDecls(function (decl) {
			if (decl.prop === "width" || decl.prop === "height") {
				addWidth(decl);
			}
			if (decl.prop === "gutters") {
				addGutters(decl, webComponents);
			}
		});
	};
});
