import * as D3 from 'd3'

import * as assign from 'deep-assign'
import 'classlist.js'

const DEFAULT_OPTIONS: Options = require('../default-options.json')

import './dng.scss'

import { DataProvider } from './data-provider'
export * from './data-provider'

import { D3BaseSelection, D3Element, ComponentBase, Graph } from 'components'


export default class DNGViz implements DNGVizAPI {
	options: Options
	data: DataProvider
	
	selection: NodeDatum
	zoom: D3.ZoomBehavior<any, any>
	transform: D3.ZoomTransform
	
	private host: D3BaseSelection
	private svg: D3Element<SVGElement>
	private scene: D3Element<SVGRectElement>
	private root: D3Element<SVGGElement>
	
	private components: ComponentBase[]
	private graph: Graph
	
	private lastRect: ClientRect
	
	constructor(public hostEl: SVGGElement, options: Options) {
		this.host = D3
			.select(hostEl)
			.classed('dng-viz', true)
		
		this.options = assign(DEFAULT_OPTIONS, options || {})
	}
	
	init() {
		let svg = this.svg = this.host
			.append('svg')
			.classed(this.options.idPrefix + '-svg', true)
		
		this.scene = svg
			.append('rect')
			.classed('scene', true)
			.on('click', () => this.deselect(true))
		
		this.root = svg
			.append('g')
			.classed('root', true)
		
		ComponentBase.initShared(this, this.root)
		this.components = [
			this.graph = new Graph(),
		]
		
		this.components.forEach(c => c.init())
		
		this.data = new DataProvider(this)
	}
	
	load() {
		if (this.options.initialSelection) {
			let initialSelection = this.data.nodes.filter(n => n.id === this.options.initialSelection)
			if (initialSelection.length) {
				this.select(initialSelection[0], false)
			}
		}
		
		this.initZoom()
		
		this.components.forEach(c => c.load(this.data))
		this.refresh()
		
		let { width, height } = this.lastRect
		this.zoom.translateBy(this.scene, width / 2, height / 2)
	}
	
	refresh(animated = false, reload = false) {
		let svgEl = this.svg.node() as SVGElement
		let rect = this.lastRect = svgEl.getBoundingClientRect()
		
		this.scene
			.attr('width', rect.width)
			.attr('height', rect.height)
		
		// TODO: if resize, substract the center offset delta from the current transform
		
		ComponentBase.resizeShared(rect)
		this.components.forEach(c => c.resize(rect, animated))
	}
	
	destroy() {
	}
	
	select(node: NodeDatum, refresh = true) {
		this.deselect(false)
		this.selection = node
		
		this.selection.ref.classList.add('selected')
		
		if (!this.selection.connections) {
			this.selection.connections = this.data.getRelated(this.selection)
		}
		
		this.selection.connections.forEach(c => {
			c.source.ref.classList.add('related')
			c.target.ref.classList.add('related')
			c.ref.classList.add('related')
		})
		
		// FIXME
		// let { x, y, k } = this.transform
		// this.selection['fx'] = x / k
		// this.selection['fy'] = y / k
		
		if (refresh) {
			this.refresh()
			this.graph.simulation.alpha(1).restart()
		}
		
		// this.centerCameraOnSelection(null)
	}
	
	deselect(refresh = true) {
		if (this.selection) {
			this.selection.ref.classList.remove('selected')
			this.selection.connections.forEach(c => {
				c.source.ref.classList.remove('related')
				c.target.ref.classList.remove('related')
				c.ref.classList.remove('related')
			})
			
			this.selection['fx'] = null
			this.selection['fy'] = null
			this.selection = null
			
			if (refresh) {
				this.refresh()
				this.graph.simulation.alpha(1).restart()
			}
		}
	}
	
	private initZoom() {
		let viz = this
		
		let zoomed = function () {
			let tickSimulation = viz.transform.k !== D3.event.transform.k
			viz.transform = D3.event.transform
			
			// TODO: typings should recognize toString() implementation?
			viz.root.attr('transform', viz.transform as any)
			
			// TODO: Debounce animated refresh to update charges only when zoom change stops
			viz.refresh(tickSimulation)
		}
		
		viz.transform = D3.zoomIdentity
		viz.zoom = D3.zoom()
			.scaleExtent([1 / 4, 8]) // TODO: parameters in %, e.g: from .25 to 4
			.on('zoom', zoomed)
		
		this.scene.call(viz.zoom as any)
	}
	
	// TODO
	private centerCameraOnSelection(position: PositionXY) {
		if (this.selection) {
			let { x, y } = this.selection
			let transition = this.root
				.transition()
				.duration(1800)
				.delay(600)
				.ease(D3.easeBackOut)
			
			let transform = D3.zoomIdentity
			transform.scale(this.transform.k)
			transform.translate(x, y)
			
			this.zoom.transform(transition, transform)
		}
		
	}
}
