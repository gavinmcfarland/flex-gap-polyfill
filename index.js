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

		// reset.append(
		// 	`${pf}gap_special: initial;`
		// );

		item.append(
			`${pf}gap_parent: ${decl.value};
			${pf}gap_new: ${decl.value};`
		);
		// formular: (parent - self) / (100 - self) * 100
		container.append(
			`${pf}gap_new: calc( ((var(${pf}gap_parent, 0%) - ${decl.value}) * var(${pf}width_percentages-decimal, 1)) / (100 - ${value.number}) * 100) !important;`
		);

	}

	// Pixels, Ems
	else {
		// reset.append(
		//    `${pf}gap_special: initial;`
		// );

		item.append(
			`${pf}gap_parent: ${decl.value};
			${pf}gap_new: ${decl.value};`
		);

		container.append(
			`${pf}gap_new: calc(var(${pf}gap_parent, 0px) - ${decl.value}) !important;`
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
		item.append(
			`margin-top: var(${pf}gap_new);
			margin-left: var(${pf}gap_new);`
		);

		container.append(
			`padding-top: 0.02px;
			margin-top: var(${pf}gap_new);
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
			`${pf}${prop}_percentages: ${decl.value};
			${pf}${prop}_percentages-decimal: ${value.number / 100};
			${pf}${prop}_new: calc(${decl.value} - var(${pf}gap_new, 0%));`
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
			`${pf}${prop}_pixels: ${decl.value};
			${pf}${prop}_new: calc(${decl.value} - var(${pf}gap_new, 0px));`
		);

		// reset.append(
		// 	`${pf}${prop}_pixels: initial;
		// 	${pf}${prop}_new: initial;`
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
