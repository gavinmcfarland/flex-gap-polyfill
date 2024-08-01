module.exports = {
	// 'gap-all': {
	// 	message: 'all options',
	// 	options: {
	// 		webComponents: true,
	// 		tailwindCSS: true,
	// 		flexGapNotSupported: '.flexGapNotSupported'
	// 	}
	// },
	// 'gap-margin-issue': {
	// 	message: 'works with margin on parent and grid'
	// },
	// 'data-uri-issue': {
	// 	message: 'trips when data uri used'
	// },
	'attr-syntax-issue': {
		message: 'trips up when / in value name because spaces removed'
	},
	'equals-sign-issue': {
		message: 'postcss-values-parser trips on equals sign'
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
