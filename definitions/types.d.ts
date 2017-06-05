declare interface NodeDatum {
	id: number
	type: NodeType
	name: string
	url: string
	weigth: number
	x?: number
	y?: number
	fx?: number
	fy?: number
	ref?: SVGGElement
}

declare interface ConnectionDatum {
	source: number
	target: number
	type: ConnectionType
	ref?: SVGLineElement
}

declare type NodeType = 'people' | 'organization'
declare type ConnectionType = 'solid' | 'dotted'

declare interface StyleRules {
	[property: string]: StyleRules | string | number
}

declare interface PositionXY {
	x: number
	y: number
}
