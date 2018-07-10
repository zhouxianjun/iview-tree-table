const webpack = require('webpack')
const cleanWebpackPlugin = require('clean-webpack-plugin')
const merge = require('webpack-merge')
const webpackBaseConfig = require('./webpack.base.config.js')
const path = require('path')

module.exports = merge(webpackBaseConfig, {
  entry: '@/index',
  output: {
    filename: 'iview-tree-table.js',
    library: 'iview-tree-table',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  plugins: [
    new cleanWebpackPlugin(['dist/*'], {
      root: path.resolve(__dirname, '../')
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
})
