import * as d3 from 'd3'

export type D3BaseElement = d3.BaseType
export type D3BaseSelection = d3.Selection<D3BaseElement, any, any, any>
export type D3Selection<D> = d3.Selection<D3BaseElement, D, any, any>

export default class DNGViz {
	private host: D3BaseSelection
	
	constructor(public hostEl: SVGGElement, public options?: DNGVizOptions) {
		this.host = d3
			.select(hostEl)
			.classed('dng-viz', true)
		
		this.host.append('svg')
	}
	
	init() {
	
	}
	
	destroy() {
	
	}
	
	load() {
	
	}
	
	refresh() {
	
	}
}
