const path = require('path')
const fs = require('fs')
const glob = require('glob')
const webpack = require('webpack')

const DashboardPlugin = require('webpack-dashboard/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin

const DEMO_BASE_HREF = '/damocles-network-graph/'

const NPM_TASK = process.env.npm_lifecycle_event

// Flags whenever the visualization is being build for development (for webpack-dev-server)
const isDevBuild = NPM_TASK.indexOf('build') === -1

// Flags if the visualization demo is being build
const isDemoBuild = NPM_TASK !== 'build'

function root(args) {
	args = Array.prototype.slice.call(arguments, 0)
	return path.join.apply(path, [__dirname].concat(args))
}

function src(path) {
	return root('src/' + path)
}

const CONFIG = {
	entry: {
		dng: src('dng.ts')
	},
	output: {
		path: root('dist'),
		filename: '[name].js',
		chunkFilename: '[id].chunk.js'
	},
	resolve: {
		extensions: ['.ts', '.js', '.json', '.scss'],
		alias: {
			dng: isDevBuild ? src('dng.ts') : root('dist/dng-viz.min.js'),
		},
		plugins: [
			new TsConfigPathsPlugin()
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

if (isDevBuild) {
	CONFIG.plugins.push(new DashboardPlugin())
	CONFIG.plugins.push(new webpack.NamedModulesPlugin())
	CONFIG.devtool = 'source-map'
	CONFIG.output.filename = '[name]-[hash].js'
	CONFIG.output.chunkFilename = '[id].[hash].chunk.js'
} else if (!isDemoBuild) {
	CONFIG.output.entry = { demo: root('demo/demo.js')}
	CONFIG.output.filename = 'dng-viz.min.js'
	CONFIG.output.library = 'DNGViz'
	CONFIG.output.libraryTarget = 'umd'
	CONFIG.output.umdNamedDefine = true
} else {
	// Add a hash to the filename
	CONFIG.output.filename = '[name]-[hash].js'
}

if (!isDevBuild) {
	CONFIG.plugins.push(new webpack.optimize.UglifyJsPlugin({
		output: {
			comments: false
		},
		mangle: {
			except: ['DNGViz']
		}
	}))
}

if (isDemoBuild) {
	CONFIG.entry = {
		"demo": root('demo/demo.js')
	}

	CONFIG.output.path = root('demo/dist')
	CONFIG.output.publicPath = isDevBuild ? '/' : DEMO_BASE_HREF

	CONFIG.plugins.push(
		new HtmlWebpackPlugin({
			inject: 'body',
			chunks: ['demo'],
			template: root('demo/demo.ejs'),
			filename: 'index.html',
			favicon: root('demo/public/fav.png')
		}),

		new CopyWebpackPlugin([
			{
				from: root('/demo/public')
			},
			{
				from: root('/dist')
			},
			{
				from: root('/data'),
				to: 'data'
			},
		])
	)

	CONFIG.devServer = {
		contentBase: root('/demo/public'),
	}
}

module.exports = CONFIG
