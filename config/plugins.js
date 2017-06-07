const webpack = require('webpack')

const Dashboard = require('webpack-dashboard/plugin')
const HtmlWebpack = require('html-webpack-plugin')
const CopyWebpack = require('copy-webpack-plugin')
const TsConfigPaths = require('awesome-typescript-loader').TsConfigPathsPlugin
const NamedModules = webpack.NamedModulesPlugin
const UglifyJs = webpack.optimize.UglifyJsPlugin

module.exports = {
	wpNamedModules: NamedModules,
	wpDashboard: Dashboard,
	wpHtml: HtmlWebpack,
	wpCopy: CopyWebpack,
	tsPaths: TsConfigPaths,
	uglify: UglifyJs,
}
