let id = 0, ids = []

// TODO: Make something using a circular type that uses CSSStyleDeclaration

export function updateStyle(context: string, rules: StyleRules, name?: string) {
	let id: string, tag: HTMLStyleElement
	
	if (name) {
		id = `gen-${name}`
	}
	
	if (id) {
		tag = document.querySelector(`style#${id}`) as HTMLStyleElement
	}
	
	if (!tag) {
		let head = document.querySelector(`head`) as HTMLHeadElement
		tag = document.createElement('style')
		
		if (id) {
			tag.id = id
		}
		
		head.appendChild(tag)
	}
	
	tag.innerHTML = fetchRules(context, rules)
	
	return tag
}

function fetchRules(context: string, rules: StyleRules, blocks = []) {
	let lines = []

	
	for (let property in rules) {
		let value = rules[property]
		if (typeof value !== 'object') {
			// TODO: for property, use camelCase to dash to avoid string keys on object literals
			lines.push(`${property}: ${value};`)
		} else {
			let nextContext = `${context} ${property}`
			fetchRules(nextContext, value, blocks)
		}
	}
	
	if (lines.length) {
		lines.unshift(`${context} {`)
		lines.push('}')
		blocks.push(lines.join(' '))
	}
	
	
	return blocks.join('\n\n')
}
