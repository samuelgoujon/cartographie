import './demo.scss';

var viz;

function init() {
	var container = document.querySelector('div#demo-target');
	var options = {
		dataPath: 'data/'
	};

	viz = new DNGViz(container, options);

	viz.init();
}

function refresh() {
	if (viz) {
		viz.refresh(true);
	}
}

window.onload = init
window.onresize = refresh
