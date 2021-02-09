const fs = require('fs');
const chokidar = require('chokidar');
const path = require('path');
const phtmlUtilityClass = require('phtml-utility-class');

let options = {
	processBlockStyles: true
}

var watching = process.argv[2]

function processPHTML(event, filepath) {

	if (/.phtml$/.test(filepath)) {
		let dirname = path.dirname(filepath)
		let basename = path.basename(filepath, '.phtml')
		let output = path.join(dirname, basename + '.html');

		fs.readFile(filepath, 'utf8', (err, html) => {
			phtmlUtilityClass.process(html, null, options).then((result) => {
				// console.log(result.html)
				fs.writeFile(output, result.html, () => true);
				console.log("HTML file rebuilt")
				// if (result.map) {
				// 	fs.writeFile(output + '.map', result.map, () => true);
				// }
			});
		});
	}

}

// processPHTML('docs/')

if (watching) {
	console.log("Watching for changes to phtml files...")
	chokidar.watch('docs/').on('all', processPHTML)
}
else {
	chokidar.watch('docs/', { persistent: false }).on('all', processPHTML)
}



