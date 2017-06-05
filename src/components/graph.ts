import * as D3 from 'd3'

import { ComponentBase, D3Selection } from 'components'
import { DataProvider } from 'dng'
import { updateStyle } from '../utils/css'

export class Graph extends ComponentBase {
	wrapper = 'g#graph'
	
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
		// link.distance(64 * 1.25)
		
		this.addRefresher(() => {
			charge.strength((d: NodeDatum) => {
				let charge = opt.defaults[d.type].charge
				
				if (this.viz.selection && this.viz.selection.id === d.id) {
					charge *= 20
				}
				
				return charge
			})
		})
		
		collision.radius(this.getRadius)
		
		simulation
			.alphaDecay(1 - Math.pow(0.001, 1 / 200))
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
			.classed('label', true)
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
		
		{ // Store DOM element references for convinience
			this.connections.each(function (this: SVGLineElement, connection: ConnectionDatum) {
				connection.ref = this
			})
			
			this.nodes.each(function (this: SVGGElement, node: NodeDatum) {
				node.ref = this
			})
		}
	}
	
	onRefresh(rect: ClientRect, animated: boolean) {
		let hasSelection = !!this.viz.selection
		let k = this.viz.transform.k
		let fontSize = 12 / k
		
		this.labels.attr('dy', d => this.getRadius(d) + (fontSize * 1.5))
		this.circles.attr('r', d => this.getRadius(d))
		
		let rules: StyleRules = {}
		
		rules['.node:hover'] = rules['.node.selected'] = {
			'circle': {
				'stroke-width': 3 / k
			}
		}
		
		rules['.connection'] = {
			'stroke-width': 1 / k,
			'opacity': hasSelection ? '0.2' : '0.8'
		}
		
		rules['.connection.focus'] = {
			'stroke-width': 1 / k,
			'opacity': hasSelection ? '0.2' : '0.8'
		}
		
		rules['.label'] = {
			'font-size': fontSize + 'px'
		}
		
		updateStyle('#' + this.id, rules, 'graph')
		
		if (animated) {
			this.simulation.alpha(0.3).restart()
		}
	}
	
	private onTick = () => {
		this.nodes.attr('transform', d => `translate(${d.x}, ${d.y})`)
		
		this.connections
			.attr('x1', (d: any) => d.source.x)
			.attr('y1', (d: any) => d.source.y)
			.attr('x2', (d: any) => d.target.x)
			.attr('y2', (d: any) => d.target.y)
	}
	
	private getRadius = (node: NodeDatum, index?: number, data?: NodeDatum[]) => {
		let k = this.viz.transform.k
		let base = this.viz.options.node.baseRadius
		let radius = base * node.weigth
		
		if (this.viz.selection && this.viz.selection.id === node.id) {
			radius *= 3
		}
		
		return radius / k
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
		console.log(this.viz.transform)
		if (this.viz.selection && this.viz.selection.id === d.id) {
			window.open(d.url, '_blank')
		} else {
			this.viz.select(d)
		}
	}
}
