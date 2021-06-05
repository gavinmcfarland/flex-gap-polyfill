module.exports = {
	classes: [
		{
			name: 'spacing',
			class: ['p', 'm'],
			children: [
				't',
				'r',
				'b',
				'l'
			],
			style({ rule, args, str }) {
				if (args) {
					let values = args;

					switch (values.length) {
						case 1:
							values.push(values[0]);
						case 2:
							values.push(values[0]);
						case 3:
							values.push(values[1]);
					}

					for (let [index, side] of rule.children.entries()) {
						str`--${rule.class}${side}: ${values[index]};\n`
					}

					return str()
				}
			}
		},
		{
			name: 'colour',
			class: 'c',
			style({ rule, str }) {
				if (rule.args) {

					str`--${rule.class}: ${rule.args[0]};\n`

					return str()
				}
			}
		},
		{
			name: 'background color',
			class: 'bgc',
			style({ rule, str }) {
				if (rule.args) {

					str`--${rule.class}: ${rule.args[0]};\n`

					return str()
				}
			}
		}
	]
}
