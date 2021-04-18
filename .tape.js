module.exports = {
	'gap-all': {
		message: 'all options',
		options: {
			webComponents: true,
			tailwindCSS: true,
			flexGapNotSupported: '.flexGapNotSupported'
		}
	},
	'gap-web-components': {
		message: 'web components support',
		options: {
			webComponents: true
		}
	},
	'gap-not-supported': {
		message: 'javascript detection',
		options: {
			flexGapNotSupported: '.flexGapNotSupported'
		}
	},
	'gap-tailwind-css': {
		message: 'tailwind support',
		options: {
			tailwindCSS: true
		}
	}
};
