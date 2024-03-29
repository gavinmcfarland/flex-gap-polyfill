module.exports = {
	plugins: [
		// require('autoprefixer')(),
		require('postcss-preset-env')({
			features: {
				'nesting-rules': true,
				'gap-properties': false,
			}
		}),
		require('./dist/index.js')({
			flexGapNotSupported: ".flex-gap-not-supported"
		})
	]
};
