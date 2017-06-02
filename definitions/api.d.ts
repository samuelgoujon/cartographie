declare interface DNGVizAPI {
	options: Options
	load: () => void
	init: () => void
	refresh: () => void
}

declare interface Options {
	idPrefix: string
	dataPath: string
	node: {
		baseRadius: number
		maxDistance: number
		defaults: {
			[type: string]: {
				weigth: number
				charge: number
			}
		}
	}
	links: {
		baseUrl: string
	}
}
