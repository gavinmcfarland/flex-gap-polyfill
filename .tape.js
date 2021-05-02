module.exports = {
	// 'gap-all': {
	// 	message: 'all options',
	// 	options: {
	// 		webComponents: true,
	// 		tailwindCSS: true,
	// 		flexGapNotSupported: '.flexGapNotSupported'
	// 	}
	// },
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
		message: 'just testing',
		options: {
			only: ['.margin'],
			flexGapNotSupported: '.flex-gap-not-supported'
		}
	}
};
