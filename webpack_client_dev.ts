let path = require('path');
let basePath = __dirname;

let HtmlWebpackPlugin = require('html-webpack-plugin');
let webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const StatsPlugin = require('stats-webpack-plugin')

import prodConfig from './webpack_client'

const config = {
    ...prodConfig,

    entry: {
        ...prodConfig.entry,
        
        main: ['./app/client/index.tsx', 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false',
            'react-hot-loader/patch'],
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new StatsPlugin('stats.json'),
        new SpriteLoaderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.IS_CLIENT' : true
        }),
        new ExtractTextPlugin('main.css', { allChunks: true }),
        /*
        new webpack.optimize.CommonsChunkPlugin({
            names: ['bootstrap'], // needed to put webpack bootstrap code before chunks
            filename: '[name].[chunkhash].js',
            minChunks: Infinity
        }),
        */

       new HtmlWebpackPlugin( {
        template: "./index.html",
        filename: "index.html",
        inject: "body"
      })

    ]
}

export default config;