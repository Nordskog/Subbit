let path = require('path');
let basePath = __dirname;

let HtmlWebpackPlugin = require('html-webpack-plugin'); //Something wrong with webpack typings
import * as Webpack from 'webpack';
import ExtractTextPlugin from "extract-text-webpack-plugin";
import StatsPlugin from 'stats-webpack-plugin';

import prodConfig from './webpack_client'

const config = {
    ...prodConfig,

    entry: {
        ...prodConfig.entry,
        
        main: ['./client/index.tsx', 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false'],
    },

    plugins: [
        new Webpack.HotModuleReplacementPlugin(),
        new Webpack.NoEmitOnErrorsPlugin(),
        new StatsPlugin('stats.json'),
        new Webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.IS_CLIENT' : true
        }),
        new ExtractTextPlugin('main.css', { allChunks: true }),

        new HtmlWebpackPlugin( {
            template: "./index.html",
            filename: "index.html",
            inject: "body"
        }),
        new Webpack.NormalModuleReplacementPlugin   //Replace nodejs log library with console output on client
        (
            /rfyServerLogging.ts/,
            'rfyClientLogging.ts'
        ),
        new Webpack.NormalModuleReplacementPlugin(   //Replace nodejs log library with console output on client
            /rfyEnvServer.ts/,
            'rfyEnvClient.ts'
        ),
        new Webpack.DefinePlugin({
            "process.env.npm_package_version": JSON.stringify( process.env.npm_package_version)
          })

    ]
}

export default config;