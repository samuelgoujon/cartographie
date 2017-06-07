## Cartographie — Damoclès

### Instalation
In this branch of the repo you can find the [minified file](https://github.com/samuelgoujon/cartographie/blob/gh-pages/dng-viz.min.js)
ready to be included on your on page.

### Usage
Once the minified file is included a `DNGViz` variable containing the component constructor should be available and can be used as follows:

```
var viz;

function init() {
	var container = document.querySelector('div#viz-target');
	var options = {
		dataPath: "path/to/data/folder",
		links: {
			baseUrl: "http://wiki.damocles.co/wiki"
		}
	};

	viz = new DNGViz(container, options);
	viz.init();
}

function refresh() {
	viz && viz.refresh(true);
}

window.onload = init
window.onresize = refresh

```

### Options
Some configuration options are available for the component. You can see all the
**[default values](https://github.com/samuelgoujon/cartographie/blob/master/default-options.json)**
and override them on the component initialization.

### Source Code
The source can be found on [master branch](https://github.com/samuelgoujon/cartographie/tree/master).
Fell free to ask for assistance to modify or rebuild the component if needed.
