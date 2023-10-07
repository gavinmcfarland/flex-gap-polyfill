const tailwindcss = require('tailwindcss');
module.exports = {
	plugins: [
		[
			require('autoprefixer'),
		],
		[
			'flex-gap-polyfill',
			{
				flexGapNotSupported: '.no-flexgap',
			},
		],
		'postcss-preset-env',
		tailwindcss
	],
};
