## D3 Network Graph

### Instalation
In this branch of the repo you can find the [minified file](https://github.com/snolflake/damocles-network-graph/blob/gh-pages/dng-viz.min.js)
ready to be included on your on page.

### Usage
Once the minified file is included a `DNGViz` variable containing the component constructor should be available and can be used as follows:
```
var viz;

function init() {
	var container = document.querySelector('div#viz-target');
	var options = {
		dataPath: 'data/',
    "links": {
      "baseUrl": "http://wiki.damocles.co/wiki"
    },
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
**[default values](https://github.com/snolflake/damocles-network-graph/blob/master/default-options.json)**
and override them on the component initialization.

### Source Code
The source can be found on [master branch](https://github.com/snolflake/damocles-network-graph/tree/master).
Fell free to ask for assistence to modify or revuild the component if needed.
