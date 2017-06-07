const path = require('path')
const util = require('util')

function log(what) {
	console.log(util.inspect(what))
}

function root(args) {
	args = Array.prototype.slice.call(arguments, 0)
	return path.join.apply(path, [__dirname, '..'].concat(args))
}

function src(path) {
	return root('src/' + path)
}

module.exports = { root, src, log }
