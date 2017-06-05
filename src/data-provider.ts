import * as D3 from 'd3'

export type DsvRows = D3.DSVParsedArray<D3.DSVRowString>

export class DataProvider {
	nodes: NodeDatum[]
	connections: ConnectionDatum[]
	
	constructor(private app: DNGVizAPI) {
		let opt = app.options
		let salt = Math.floor(Math.random() * 100000)
		D3.csv(`${opt.dataPath}/nodes.csv?v${salt}`, this.parseNodes)
		D3.csv(`${opt.dataPath}/connections.csv?v${salt}`, this.parseConnections)
	}
	
	private parseNodes = (error: any, rows: DsvRows) => {
		this.nodes = []
		
		let baseUrl = this.app.options.links.baseUrl
		let defaults = this.app.options.node.defaults
		
		for (let row of rows) {
			let node = row as any as NodeDatum
			node.id = +node.id
			
			if (!node.name) {
				throw `Field "name" missing on node ID ${node.id}`
			}
			
			if (!node.type) {
				throw `Field "type" missing on node ID ${node.id}`
			}
			
			if (!node.url) {
				let nameURI = encodeURIComponent(node.name.replace(' ', '_'))
				node.url = node.url || `${baseUrl}/${nameURI}`
			}
			
			if (!node.weigth) {
				node.weigth = defaults[node.type].weigth
			}
			
			this.nodes.push(node)
		}
		
		this.checkIfAllLoaded()
	}
	
	private parseConnections = (error: any, rows: DsvRows) => {
		this.connections = []
		
		for (let row of rows) {
			let connection = row as any as ConnectionDatum
			
			if (!connection.type) {
				console.log(connection)
				throw `Field "type" missing on connection`
			}
			
			connection.source = +connection.source
			connection.target = +connection.target
			
			this.connections.push(connection)
		}
		
		this.checkIfAllLoaded()
	}
	
	private checkIfAllLoaded = () => {
		if (this.nodes && this.connections) {
			this.app.load()
		}
	}
}
