declare interface NodeDatum {
	id: number
	type: NodeType
	name: string
	url: string
	weigth: number
}

declare interface ConnectionDatum {
	source: number
	target: number
	type: ConnectionType
}

declare type NodeType = 'people' | 'organization'
declare type ConnectionType = 'solid' | 'dotted'

