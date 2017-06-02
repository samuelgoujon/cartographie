import * as D3 from 'd3'
import { ComponentBase, D3Selection } from 'components'
import { DataProvider } from 'dng'

export class Graph extends ComponentBase {
	simulation: D3.Simulation<NodeDatum, ConnectionDatum>
	link: D3.ForceLink<NodeDatum, ConnectionDatum>
	nodes: D3Selection<NodeDatum>
	connections: D3Selection<ConnectionDatum>
	
	onInit() {
		let opt = this.viz.options.node
		
		let simulation = this.simulation = D3.forceSimulation<NodeDatum, ConnectionDatum>()
		let link = this.link = D3.forceLink<NodeDatum, ConnectionDatum>()
		let charge = D3.forceManyBody()
		let center = D3.forceCenter(0, 0)
		
		link.id(this.getId)
		charge.strength((d: NodeDatum) => opt.defaults[d.type].charge)
		charge.distanceMax(opt.maxDistance)
		
		simulation
			.force('link', link)
			.force('charge', charge)
			.force('center', center)
	}
	
	onLoad(data: DataProvider) {
		let opt = this.viz.options
		
		let dragBehavior = D3.drag()
			.on('start', this.onDragStart)
			.on('drag', this.onDrag)
			.on('end', this.onDragEnd)
		
		this.connections = this.root
			.selectAll('.connection')
			.data(data.connections)
			.enter().append('line')
			.attr('class', c => `connection connection-${c.type}`)
		
		this.nodes = this.root
			.selectAll('.node')
			.data(data.nodes)
			.enter().append('g')
			.attr('class', d => `node node-${d.type}`)
		
		this.nodes
			.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', d => d.weigth * opt.node.baseRadius)
		
		this.nodes
			.append('title')
			.text(d => d.name)
		
		this.nodes.call(dragBehavior as any)
		this.nodes.on('click', d => window.open(d.url, '_blank'))
		
		this.simulation
			.nodes(data.nodes)
			.on('tick', this.onTick)
		
		this.link
			.links(data.connections)
	}
	
	onRefresh(rect: ClientRect) {
		let { width, height } = rect
		this.simulation.force('center', D3.forceCenter(width / 2, height / 2))
		this.simulation.restart()
	}
	
	private onTick = () => {
		let { max, min } = Math
		let { width, height } = this.rect
		
		// TODO: check type
		let margin = 8 * 4
		this.nodes
			.attr('transform', (d: any) => {
				d.x = max(margin, min(d.x, width - margin))
				d.y = max(margin, min(d.y, height - margin))
				return `translate(${d.x}, ${d.y})`
			})
		
		this.connections
			.attr('x1', (d: any) => d.source.x)
			.attr('y1', (d: any) => d.source.y)
			.attr('x2', (d: any) => d.target.x)
			.attr('y2', (d: any) => d.target.y)
	}
	
	private getRadius(node: NodeDatum, index: number, data: NodeDatum[]) {
	
	}
	
	private getId(node: NodeDatum, index: number, data: NodeDatum[]) {
		return node.id.toString()
	}
	
	private onDragStart = (d) => {
		if (!D3.event.active) this.simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}
	
	private onDrag = (d) => {
		d.fx = D3.event.x;
		d.fy = D3.event.y;
	}
	
	private onDragEnd = (d) => {
		if (!D3.event.active) this.simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}
}
