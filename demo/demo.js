
import * as OptionsBox from './options-box'
import * as defaults from '../data/options'

import DNGViz from 'dng'
import './demo.scss'

var viz, vizContainer, optionsObjectRef

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
	vizContainer = document.querySelector('div#demo-target')
	viz = new DNGViz(vizContainer, /* Optional -> */ optionsObjectRef)
	viz.init()

	// The HTML element holding the visualization will fire the 'selectionChange' event
	// whenever a node is selected or deselected.
	vizContainer.addEventListener('select', function () {
		console.log('Event received on parent application: Data node selected')

		var selection = viz.selection


		if (selection) {
			console.debug('Selected node:', selection.id)
			if (selection.paths) {
				console.debug('Selected node paths:', selection.paths)
			}
		} else {
			console.debug('Selection cleared!')
		}
	})

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
