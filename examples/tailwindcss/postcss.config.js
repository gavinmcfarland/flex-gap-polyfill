module.exports = {
	plugins: {
		'tailwindcss': {},
		'flex-gap-polyfill': {
			webComponents: true,
			tailwindCSS: true,
			flexGapNotSupported: '.flexGapNotSupported'
		}
	}
};
