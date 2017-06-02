import * as D3 from 'd3'

import { default as DNGViz, DataProvider } from 'dng'
import { D3BaseSelection, D3Selection, RefreshHandler, ReloadHandler } from 'components'

export interface ComponentWrapper {
	type?: string
	before?: string
	id?: string
	classes?: string[]
	relative?: boolean,
	fillParent?: boolean,
}

export abstract class ComponentBase {
	static parent: DNGViz
	private static defaultRoot: D3BaseSelection
	
	id: string
	wrapper: string
	options: ComponentWrapper
	
	rootParent: D3BaseSelection
	rect: ClientRect
	refreshers: RefreshHandler[] = []
	reloaders: ReloadHandler[] = []
	
	private initialized = false
	
	get viz(): DNGViz {
		return SELF.parent
	}
	
	get data(): DataProvider {
		return SELF.parent.data
	}
	
	get base() {
		return SELF
	}
	
	constructor(public root: D3BaseSelection = SELF.defaultRoot) {
		this.rootParent = root
	}
	
	onInit() {}
	onLoad(data: DataProvider) {}
	onIntro() {}
	onRefresh(rect: ClientRect, animated: boolean) {}
	onDestroy() {}
	onReload() {}
	
	static initShared(parent: DNGViz, defaultRoot: D3BaseSelection) {
		SELF.parent = parent
		SELF.defaultRoot = defaultRoot
	}
	
	init() {
		if (!this.initialized) {
			this.applyWrapperOptions()
			this.onInit()
			this.initialized = true
		}
		
		return this
	}
	
	load(data: DataProvider) {
		this.onLoad(data)
		return this
	}
	
	reload() {
		this.onReload()
		this.reloaders.forEach(r => r())
		return this
	}
	
	static updateShared(data: DataProvider) {
	}
	
	intro() {
		this.onIntro()
	}
	
	static resizeShared(rect: ClientRect) {
	}
	
	resize(rect: ClientRect, animated: boolean) {
		SELF.resizeShared(rect)
		
		if (this.options && this.options.relative) {
			let rootEl = this.root.node() as Element
			rect = rootEl.getBoundingClientRect()
		}
		
		if (this.rootParent && this.options && this.options.fillParent) {
			this.root
				.attr('width', this.rootParent.attr('width'))
				.attr('height', this.rootParent.attr('height'))
		}
		
		this.rect = rect
		this.onRefresh(rect, animated)
		this.refreshers.forEach(r => r(rect))
		
		return this
	}
	
	destroy() {
		this.onDestroy()
	}
	
	addRefresher(resizer: RefreshHandler, execute = false) {
		this.refreshers.push(resizer)
		if (execute) {
			resizer(this.rect)
		}
	}
	
	addReloader(reloader: ReloadHandler, execute = false) {
		this.reloaders.push(reloader)
		if (execute) {
			reloader()
		}
	}
	
	transition(selection: D3BaseSelection, animated = true) {
		return SELF.buildTransition(selection, animated)
	}
	
	static buildTransition(selection: D3BaseSelection, animated = false, duration = 1) {
		
		return selection
			.transition()
			.duration(animated ? 300 : 0)
			.ease(D3.easeBackOut)
	}
	
	append(selector: string, root = this.root) {
		let { tag, id, classes } = this.parseSelector(selector)
		
		let result = root.append(tag)
		if (classes) {
			result.attr('class', classes.join(' '))
		}
		
		if (id) {
			result.attr('id', id)
		}
		
		return result
	}
	
	appendAll<DataType>(
		data: DataType[],
		asSelector: string,
		root = this.root,
		key?: (DataType) => any
	): D3Selection<DataType> {
		let { tag, classes, dynamics, conditionals } = this.parseSelector(asSelector)
		let identifier = tag + (classes.length ? '.' + classes.join('.') : '')
		let baseSelection = root.selectAll(identifier)
		let dataJoin = key ? baseSelection.data(data, key) : baseSelection.data(data)
		
		let selection = dataJoin
			.enter()
			.append(tag)
		
		selection.attr('class', datum => {
			let nodeClasses = classes.slice()
			for (let dynamicClass of dynamics) {
				let [prefix, property] = dynamicClass.split('$')
				if (datum[property]) {
					nodeClasses.push(`${prefix}${datum[property]}`)
				}
			}
			
			for (let conditionalClass of conditionals) {
				let [className, property] = conditionalClass.split('?')
				if (datum['selected']) {
					debugger
				}
				
				if (datum[property || className]) {
					nodeClasses.push(className)
				}
			}
			
			return nodeClasses.join(' ')
		})
		
		return selection as any as D3Selection<DataType>
	}
	
	private parseSelector(selector: string) {
		let tag, tags = selector.match(/^[^.#]*/g)
		let allClasses = selector.match(/\.([^.#]*)/g) || []
		let id, ids = selector.match(/#([^.#]*)/g)
		
		if (!tags || tags.length > 1) {
			throw 'Invalid HTML tag'
		} else {
			tag = tags[0]
		}
		
		if (allClasses) {
			allClasses = allClasses.map(c => c.slice(1))
		}
		
		let classes = allClasses.filter(c => !(/[$?]/.test(c)))
		let dynamics = allClasses.filter(c => (/\$/.test(c)))
		let conditionals = allClasses.filter(c => (/\?/.test(c)))
		
		if (ids) {
			if (ids.length > 1) {
				throw 'Provide only one id'
			} else {
				id = ids[0].slice(1)
			}
		}
		
		return { tag, id, classes, dynamics, conditionals }
	}
	
	private applyWrapperOptions() {
		if (this.wrapper) {
			let selector = this.parseSelector(this.wrapper)
			this.options = this.options || {}
			this.options.type = selector.tag
			this.options.id = selector.id
			this.options.classes = selector.classes
		}
		
		if (!this.options) {
			return
		}
		
		let wrapper = this.options
		
		if (wrapper.type) {
			this.rootParent = this.root
			if (wrapper.before) {
				this.root = this.root.insert(wrapper.type, wrapper.before)
			} else {
				this.root = this.root.append(wrapper.type)
			}
		}
		
		if (wrapper.classes) {
			wrapper.classes.forEach(name => this.root.classed(name,  true))
		}
		
		if (wrapper.id) {
			this.id = `${this.viz.options.idPrefix}-${wrapper.id}`
			this.root.attr('id', this.id)
		}
	}
}

const SELF = ComponentBase
