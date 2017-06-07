const DEMO_BASE_HREF = '/damocles-network-graph/'

const webpack = require('webpack')

const { root, src } = require('./config/utils')
const { DEV, DEMO, BUILD, PUBLISH } = require('./config/flags')
const PLUGINS = require('./config/plugins')

const CONFIG = {
	entry: {
		dng: src('main.ts')
	},

	output: {
		path: root('dist'),
		filename: '[name].js',
		chunkFilename: '[id].chunk.js'
	},

	resolve: {
		extensions: ['.ts', '.js', '.scss', '.json', '.csv'],
		alias: {
			dng: DEMO ? root('dist/dng-viz.min.js') : src('main.ts'),
			components: src('components')
		},
		plugins: [
			new PLUGINS.tsPaths()
		]
	},

	module: {
		loaders: [
			{ test: /\.ts$/, loader: 'awesome-typescript-loader' },
			{ test: /\.json$/, loader: 'json-loader' },
			{ test: /\.scss$/, loader: 'style-loader!raw-loader!sass-loader' },
		]
	},

	plugins: [],
}

if (DEMO) {
	let foldersToCopy = [
		{ from: root('/demo/public') },
		{ from: root('/data'), to: 'data' },
	]

	let htmlOptions = {
		inject: 'body',
		template: root('demo/demo.ejs'),
		filename: 'index.html',
		favicon: root('demo/public/fav.png')
	}

	if (DEV) {
		CONFIG.output.publicPath = '/'
		htmlOptions.chunks = ['dng', 'demo']

		CONFIG.entry = {
			dng: src('main.ts'),
			demo: root('demo/demo.js')
		}
	}

	if (PUBLISH) {
		CONFIG.output.publicPath = DEMO_BASE_HREF
		htmlOptions.chunks = ['demo']

		CONFIG.entry = {
			demo: root('demo/demo.js')
		}

		foldersToCopy.push({ from: root('/dist') })
	}

	CONFIG.output.path = root('demo/dist')
	CONFIG.output.filename = '[name]-[hash].js'
	CONFIG.output.chunkFilename = '[id].[hash].chunk.js'

	CONFIG.plugins.push(
		new PLUGINS.wpHtml(htmlOptions),
		new PLUGINS.wpCopy(foldersToCopy)
	)

	CONFIG.devServer = {
		contentBase: root('/demo/public')
	}
}

if (BUILD) {
	CONFIG.output.filename = 'dng-viz.min.js'
	CONFIG.output.library = 'DNGViz'
	CONFIG.output.libraryTarget = 'var'
	CONFIG.output.umdNamedDefine = true

	let minifier = new PLUGINS.uglify({
		output: {
			comments: false
		},
		mangle: {
			except: ['DNGViz']
		}
	})

	CONFIG.plugins.push(minifier)
}

if (DEV) {
	CONFIG.plugins.push(new PLUGINS.wpDashboard())
	CONFIG.plugins.push(new PLUGINS.wpNamedModules())
	CONFIG.devtool = 'source-map'
}

module.exports = CONFIG
