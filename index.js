import postcss from "postcss";
import valueParser from "postcss-value-parser";

const pf = "--FI_";
const CS = " > *";
const SS = " > ::slotted(*)";


function addGap(property) {

	createRules();

	// Percentages
	if (percentage) {

		container.append(
		   `${pf}gap: ${value};
			${pf}gap_container: ${value};
			${pf}gap_number: ${value.number};
			${pf}gap_percentage-decimal: ${value.number} / 100;
			${pf}gap_negative: -1 * ${value};
			${pf}gap_is-percentages: true;
			${pf}gap_new: `
		);

		item.append(
		   `${pf}gap_difference: calc(var(${pf}gap_container) - var(${pf}gap_item));
			${pf}gap_new: var(${pf}gap_difference);`
		);

		reset.append(
		   `{pf}gap_difference: initial;
			{pf}gap_new: initial`
		);

	}

	// Pixels, Ems
	else {

		container.append(
		   `${pf}gap: ${value};
			${pf}gap_negative: -1 * ${value};
			${pf}gap_is-pixels: true;
			${pf}gap_parent: var(${pf}gap);
			${pf}gap_new: calc(var(${pf}gap_parent, 0px) - var(${pf}gap_child, 0px));`
		);

		item.append(
		   `${pf}gap_difference: calc(var(${pf}gap_parent, 0px) - var(${pf}gap_child, 0px));
			${pf}gap_new: var(${pf}gap_parent);`
		);

		childContainer.append(
		   `${pf}gap_difference: initial;
			${pf}gap_new: initial`
		);

	}

	// If web components
	if (webComponents) {
		slotted.append(
			`${pf}gap: initial;
			 ${pf}gap_parent: ${decl.value} !important;
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
			margin-top; var(${pf}gap_new);
			margin-left: var(${pf}gap_new);`
		);

		item.append(
		   `margin-top; var(${pf}gap_new);
			margin-left: var(${pf}gap_new);`
		);
	}

	decl.remove();
}


function addWidth(decl) {

	// Percentages
	if (percentage) {
		original.before {
		   `${pf}${prop}: ${value};
			${pf}${prop}_number: ${value.number};
			${pf}${prop}_percentage_decimal: ${value.number / 100};
			${pf}${prop}_is-percentage: ${value};
			${pf}${prop}_new: calc(${value} + var(${pf}gutters_width, var(${pf}gutters_child-width, var(${pf}gutters, 0px))));`
		}

		reset.before {
		   `${pf}${prop}: initial;
			${pf}${prop}_new: initial;`
		}
	}

	// Pixels, Ems
	else {
		original.before {
		   `${pf}${prop}: ${value};
			${pf}${prop}_is-pixel: ${value};
			${pf}${prop}_new: calc(${value} + var(${pf}gutters_percentage-width, var(${pf}gutters_pixels, 0px)));;`
		}

		reset.before {
		   `${pf}${prop}: initial;
			${pf}${prop}_new: initial;`
		}
	}

	// Both
	original.append(
	   `${pf}${prop}; var(${pf}width_new);`
	);

	decl.remove();
}

function createRules() {

	if (gutters, width) {
		const container = decl.parent;
		const item = postcss.rule({selector: container.selector + CS});
		const reset = postcss.rule({selector: container.selector + CS + CS});

		container.before(item);
		item.before(reset);
	}
	if (gutters) {
		if (webComponents) {
			const slotted = postcss.rule({selector: container.selector + SS});
			container.before(slotted);
		}
	}

}

function cleanRules() {
	if (gutters, width) {
		container.walk(i => { i.raws.before = "\n\t" });
		item.walk(i => { i.raws.before = "\n\t" });
	}
	if (gutters) {
		reset.walk(i => { i.raws.before = "\n\t" });
		slotted.walk(i => { i.raws.before = "\n\t" });
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
