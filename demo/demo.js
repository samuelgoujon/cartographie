
import * as OptionsBox from './options-box'
import * as defaults from '../default-options.json'

import DNGViz from 'dng'
import './demo.scss'

var viz, container

window.onload = function () {
	var optionsContainer = document.getElementById('demo-options')

	var optionsBox = OptionsBox.init(defaults, reloadViz, refreshViz)
	optionsContainer.appendChild(optionsBox)

	initViz()
}

window.onresize = function () {
	if (viz) {
		viz.refresh()
	}
}

function initViz() {
	container = document.querySelector('div#demo-target')
	viz = new DNGViz(container)
	viz.init()
}

function reloadViz() {
	if (viz) {
		viz.destroy()
	}

	initViz()
}

function refreshViz() {
	if (viz) {
		viz.refresh(true, true)
	}
}
