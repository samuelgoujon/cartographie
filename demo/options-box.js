var demoOptions = {
	'Apply Options': null
}

export function init(options, resetCallback) {
	demoOptions['Apply Options'] = resetCallback

	var gui = new dat.GUI({
		name: 'RCViz Options',
		autoPlace: false
	})

	gui.add(demoOptions, 'Apply Options')
	gui.closed = true

	return gui.domElement
}
