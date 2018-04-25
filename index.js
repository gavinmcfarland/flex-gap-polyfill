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

	let perNumber = 1 / ((100 - value.number) / value.number);
	let perNumber2 = 100 / ((100 - value.number) / value.number);

	console.log(perNumber, perNumber2);

	// Percentages
	if (value.unit === "%") {

		reset.append(
			`${pf}gap_special: initial;
			${pf}gap_on-width-child: initial;`
		);

		item.append(
			`${pf}gap: initial;
			${pf}gap_on-width: initial;

			${pf}gap_parent: ${decl.value} !important;
			${pf}gap_parent-per-number: ${perNumber2} !important;
			${pf}gap_parent-per: ${perNumber2 + "%"} !important;
			${pf}gap_difference: calc(var(${pf}gap, 0px) - var(${pf}gap_parent, 0px));
			${pf}gap_difference_per: calc(100% / ((100 - var(${pf}gap_difference)) / var(${pf}gap_difference)));
			${pf}gap_special: calc(((var(${pf}gap_parent-per-number) - var(${pf}gap_per-number)) / var(${pf}gap_parent-per-number)) * var(${pf}gap_parent));
			${pf}gap_new: var(${pf}gap_parent, 0px);
			${pf}gap_on-width-child: calc(-1 * var(${pf}gap_parent, 0px)) !important;

			margin-top: var(${pf}gap_new);
			margin-left: var(${pf}gap_new);`
		);

		container.append(
			`${pf}gap_parent: initial;

			${pf}gap: ${decl.value} !important;
			${pf}gap_per-decimal: ${value.number / 100} !important;
			${pf}gap_on-width-per: calc(var(${pf}width-px, 0px) * var(${pf}gap_per-decimal, 0px));
			${pf}gap_per-number: ${perNumber2} !important;
			${pf}gap_on-width: calc((100% / ((100 - ${value.number}) / ${value.number})) * var(${pf}width)) !important;
			${pf}per-number: ${perNumber} !important;
			${pf}gap_new: var(${pf}gap_special, calc(var(${pf}gap_parent, 0px) - (var(${pf}per-number, 0px) * var(${pf}gap_parent, 100%)))) !important;

			padding-top: 0.02px;
			margin-top: calc(var(${pf}gap_new) * var(${pf}width, 1));
			margin-left: calc(var(${pf}gap_new) * var(${pf}width, 1));`
		);

	}

	// Pixels, Ems
	else {
		reset.append(
		   `${pf}gap_on-width-child: initial;
			${pf}gap_special: initial;`
		);

		item.append(
			`${pf}gap: initial;
			${pf}gap_on-width: initial;
			${pf}gap_parent: ${decl.value} !important;
			${pf}gap_negative: calc(-1 * var(${pf}gap, 0px)) !important;
			${pf}gap_on-width-child: calc(-1 * var(${pf}gap_parent, 0px)) !important;
			${pf}gap_difference: calc(var(${pf}gap, 0px) - var(${pf}gap_parent, 0px));
			${pf}gap_new: var(${pf}gap_parent, 0px);

			margin-top: var(${pf}gap_new);
			margin-left: var(${pf}gap_new);
			`
		);

		container.append(
			`${pf}gap_parent: initial;
			${pf}gap: ${decl.value} !important;
			${pf}gap_on-width: var(${pf}gap_parent);
			${pf}gap_new: calc(var(${pf}gap_parent, 0px) - var(${pf}gap, 0px)) !important;

			padding-top: 0.02px;
			margin-top: var(${pf}gap_new);
			margin-left: var(${pf}gap_new);`
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
	// else {
	// 	container.append(
	// 		`padding-top: 0.02px;
	// 		margin-top: var(${pf}gap_new);
	// 		margin-left: var(${pf}gap_new);`
	// 	);
	//
	// 	item.append(
	// 		`margin-top: var(${pf}gap_new);
	// 		margin-left: var(${pf}gap_new);`
	// 	);
	// }

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
			`${pf}${prop}: ${value.number / 100};
			${pf}${prop}_new: calc(${decl.value} + var(${pf}gap_on-width, var(${pf}gap_on-width-child, var(${pf}gap, 0px))));`
		);

		reset.append(
			`${pf}${prop}: initial;`
		);
	}

	// Pixels, Ems
	else {
		container.append(
			`${pf}${prop}-px: ${decl.value};
			${pf}${prop}_new: calc(${decl.value} + var(${pf}gap_on-width-per, var(${pf}gap, 0px)))`
		);

		// reset.append(
		// 	`${pf}${prop}: initial;`
		// );
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
				addGap(decl, webComponents);
			}
		});
	};
});
