import postcss from "postcss";
var valueParser = require('postcss-value-parser');

const pf = "--FI_";
const CS = " > *";
const SS = " > ::slotted(*)";


function addGap(decl, webComponents) {

	let value = valueParser.unit(decl.value);

	const container = decl.parent;
	const item = postcss.rule({selector: container.selector + CS});
	const reset = postcss.rule({selector: container.selector + CS + CS});
	const slotted = postcss.rule({selector: container.selector + SS});

	container.before(slotted);
	container.before(item);
	item.before(reset);

	// Percentages
	if (value.unit === "%") {

		container.append(
		   `${pf}gap: ${value.number};
			${pf}gap_container: ${value.number};
			${pf}gap_number: ${value.number};
			${pf}gap_percentage-decimal: ${value.number / 100};
			${pf}gap_negative:  ${-1 * value.number + value.unit};
			${pf}gap_is-percentages: true;
			${pf}gap_new: `
		);

		item.append(
		   `${pf}gap_difference: calc(var(${pf}gap_container) - var(${pf}gap_item));
			${pf}gap_new: var(${pf}gap_difference);`
		);

		reset.append(
		   `${pf}gap_difference: initial;
			${pf}gap_new: initial`
		);

	}

	// Pixels, Ems
	else {
		container.append(
		   `${pf}gap: ${decl.value} !important;
			${pf}gap_is-pixels: true;
			${pf}gap_parent: initial;
			${pf}gap_new: calc(var(${pf}gap_parent, 0px) - var(${pf}gap, 0px));`
		);

		item.append(
		   `${pf}gap_parent: ${decl.value} !important;
			${pf}gap: initial;
			${pf}gap_negative: ${-1 * value.number + value.unit};
			${pf}gap_difference: calc(var(${pf}gap, 0px) - var(${pf}gap_parent, 0px));
			${pf}gap_new: var(${pf}gap_parent, 0px);`
		);

		reset.append(
		   `${pf}gap_difference: initial;
			${pf}gap_new: initial`
		);

	}

	// If web components
	if (webComponents === true) {
		slotted.append(
			`${pf}gap: initial;
			 ${pf}gap_parent: ${value.number} !important;
			 ${pf}gap_negative: calc(var(${pf}gap, 0px) - var(${pf}gap_child, 0px)) !important;
			 ${pf}gap_new: var(${pf}gap, 0px);`
		);
		slotted.append(
		   `margin-top; var(${pf}gap_new) !important;
			margin-left: var(${pf}gap_new) !important;`
		);
	}
	else {
		container.append(
		   `padding-top: 0.02px;
			margin-top: var(${pf}gap_new);
			margin-left: var(${pf}gap_new);`
		);

		item.append(
		   `margin-top: var(${pf}gap_new);
			margin-left: var(${pf}gap_new);`
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
		   `${pf}${prop}: ${decl.value};
			${pf}${prop}_number: ${value.number};
			${pf}${prop}_percentage_decimal: ${value.number};
			${pf}${prop}_is-percentage: ${value.number};
			${pf}${prop}_new: calc(${decl.value} + var(${pf}gutters_width, var(${pf}gutters_child-width, var(${pf}gutters, 0px))));`
		);

		reset.append(
			`${pf}${prop}: initial;
			${pf}${prop}_new: initial;`
		);
	}

	// Pixels, Ems
	else {
		container.append(
		   `${pf}${prop}: ${value.number};
			${pf}${prop}_is-pixel: ${value.number};
			${pf}${prop}_new: calc(${decl.value} + var(${pf}gutters_percentage-width, var(${pf}gutters_pixels, 0px)));`
		);

		reset.append(
		   `${pf}${prop}: initial;
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

// function createRules() {
//
// 	if (gutters, width) {
// 		const container = decl.parent;
// 		const item = postcss.rule({selector: container.selector + CS});
// 		const reset = postcss.rule({selector: container.selector + CS + CS});
//
// 		container.before(item);
// 		item.before(reset);
// 	}
// 	if (gutters) {
// 		if (webComponents) {
// 			const slotted = postcss.rule({selector: container.selector + SS});
// 			container.before(slotted);
// 		}
// 	}
//
// }

// function cleanRules() {
// 	if (gutters, width) {
// 		container.walk(i => { i.raws.before = "\n\t" });
// 		item.walk(i => { i.raws.before = "\n\t" });
// 	}
// 	if (gutters) {
// 		reset.walk(i => { i.raws.before = "\n\t" });
// 		slotted.walk(i => { i.raws.before = "\n\t" });
// 	}
// }

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
				addGap(decl, webComponents);
			}
		});
	};
});
