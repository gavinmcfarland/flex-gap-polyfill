module.exports = {
	plugins: [
		require('autoprefixer')(),
		require('postcss-preset-env')({
			features: {
				'nesting-rules': true
			}
		}),
		require('./index.js')()
	]
};
