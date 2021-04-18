import babel from 'rollup-plugin-babel';

export default {
	input: 'src/index.js',
	output: [
		{ file: 'dist/index.js', format: 'cjs', sourcemap: true, strict: false },
		{ file: 'dist/index.mjs', format: 'esm', sourcemap: true, strict: false }
	],
	plugins: [
		babel({
			presets: [
				['@babel/env', { modules: false, targets: { node: 8 } }]
			]
		})
	]
};
