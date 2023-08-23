module.exports = {
	// 'gap-all': {
	// 	message: 'all options',
	// 	options: {
	// 		webComponents: true,
	// 		tailwindCSS: true,
	// 		flexGapNotSupported: '.flexGapNotSupported'
	// 	}
	// },
	'gap-margin-issue': {
		message: 'works with margin on parent and grid'
	},
	'gap-width': {
		message: 'works with width'
	},
	'gap-web-components': {
		message: 'web components support',
		options: {
			webComponents: true
		}
	},
	'gap-not-supported': {
		message: 'when flex gap support can be detected',
		options: {
			flexGapNotSupported: '.flex-gap-not-supported'
		}
	},
	'testing': {
		message: 'just testing'
	},
	'gap-multiple-selectors': {
		message: 'when multiple selectors are used',
	}
};
