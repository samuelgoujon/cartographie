import * as D3 from 'd3'
import { ComponentBase, D3Selection } from 'components'
import { DataProvider } from 'dng'

export class Graph extends ComponentBase {
	simulation: D3.Simulation<NodeDatum, ConnectionDatum>
	link: D3.ForceLink<NodeDatum, ConnectionDatum>
	connections: D3Selection<ConnectionDatum>
	labels: D3Selection<NodeDatum>
	nodes: D3Selection<NodeDatum>
	circles: D3Selection<NodeDatum>
	
	onInit() {
		let opt = this.viz.options.node
		
		let simulation = this.simulation = D3.forceSimulation<NodeDatum, ConnectionDatum>()
		let link = this.link = D3.forceLink<NodeDatum, ConnectionDatum>()
		let charge = D3.forceManyBody()
		let collision = D3.forceCollide()
		let center = D3.forceCenter(0, 0)
		
		let gravityX = D3.forceX(0).strength(0.06)
		let gravityY = D3.forceY(0).strength(0.08)
		
		link.id(this.getId)
		link.distance(64 * 1.5)
		
		this.addRefresher(() => {
			charge.strength((d: NodeDatum) => {
				let charge = opt.defaults[d.type].charge
				
				if (this.viz.selection && this.viz.selection.id === d.id) {
					charge *= 20
				}
				
				return charge
			})
		})
		// charge.distanceMax(opt.maxDistance)
		
		collision.radius(this.getRadius)
		
		simulation
			.alphaDecay(1 - Math.pow(0.001, 1 / 2000))
			.force('link', link)
			.force('charge', charge)
			.force('collision', collision)
			.force('center', center)
			.force('gravityX', gravityX)
			.force('gravityY', gravityY)
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
		
		this.circles = this.nodes
			.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
		
		this.labels = this.nodes
			.append('text')
			.text(d => d.name)
		
		this.nodes
			.append('title')
			.text(d => d.name)
		
		this.nodes.call(dragBehavior as any)
		this.nodes.on('click', this.onClick)
		
		this.simulation
			.nodes(data.nodes)
			.on('tick', this.onTick)
		
		this.link
			.links(data.connections)
	}
	
	onRefresh(rect: ClientRect) {
		// let { width, height } = rect
		// this.simulation.force('center', D3.forceCenter(width / 2, height / 2))
		this.simulation.alpha(0.3).restart()
		
		this.labels.attr('dy', d => this.getRadius(d) + 16)
		this.nodes.classed('selected', (d) => this.viz.selection && this.viz.selection.id === d.id)
	}
	
	private onTick = () => {
		let { max, min } = Math
		let { width, height } = this.rect
		
		// TODO: review
		let w = width / 2
		let h = height / 2
		let margin = 8 * 4
		
		this.nodes
			.attr('transform', (d: any) => {
				d.x = max(margin - w, min(d.x, w - margin))
				d.y = max(margin - h, min(d.y, h - (margin * 2)))
				return `translate(${d.x}, ${d.y})`
			})
		
		this.circles
			.attr('r', d => this.getRadius(d))
		
		this.connections
			.attr('x1', (d: any) => d.source.x)
			.attr('y1', (d: any) => d.source.y)
			.attr('x2', (d: any) => d.target.x)
			.attr('y2', (d: any) => d.target.y)
	}
	
	private getRadius = (node: NodeDatum, index?: number, data?: NodeDatum[]) => {
		let base = this.viz.options.node.baseRadius
		let radius = base * node.weigth
		
		if (this.viz.selection && this.viz.selection.id === node.id) {
			radius *= 3
		}
		
		return radius
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
	
	private onClick = (d) => {
		if (this.viz.selection && this.viz.selection.id === d.id) {
			window.open(d.url, '_blank')
		} else {
			this.viz.select(d)
		}
	}
}
