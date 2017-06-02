import * as d3 from 'd3'
import * as assign from 'deep-assign'

const DEFAULT_OPTIONS: Options = require('../default-options.json')

import './dng.scss'

import { DataProvider } from './data-provider'
export * from './data-provider'

import { D3BaseSelection, D3Element, ComponentBase, Graph } from 'components'


export default class DNGViz implements DNGVizAPI {
	options: Options
	data: DataProvider
	
	private host: D3BaseSelection
	private svg: D3Element<SVGElement>
	private scene: D3Element<SVGRectElement>
	private root: D3Element<SVGGElement>
	
	private components: ComponentBase[]
	private graph: Graph
	
	private lastRect: ClientRect
	
	constructor(public hostEl: SVGGElement, options: Options) {
		this.host = d3
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
		this.components.forEach(c => c.load(this.data))
		this.refresh()
	}
	
	refresh(animated = false, reload = false) {
		let svgEl = this.svg.node() as SVGElement
		let rect = this.lastRect = svgEl.getBoundingClientRect()
		
		this.scene
			.attr('width', rect.width)
			.attr('height', rect.height)
		
		// this.root.attr('transform', `translate(${(rect.width / 2)}, ${rect.height / 2})`)
		
		ComponentBase.resizeShared(rect)
		this.components.forEach(c => c.resize(rect, animated))
	}
	
	destroy() {
	}
}
