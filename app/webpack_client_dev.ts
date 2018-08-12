let path = require('path');
let basePath = __dirname;

import clientConfig from '../config'

let HtmlWebpackPlugin = require('html-webpack-plugin'); //Something wrong with webpack typings
import * as Webpack from 'webpack';
import ExtractTextPlugin from "extract-text-webpack-plugin";
import StatsPlugin from 'stats-webpack-plugin';
import SitemapPlugin from 'sitemap-webpack-plugin';
import RobotstxtPlugin from 'robotstxt-webpack-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';

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
        new OptimizeCssAssetsPlugin({}),

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
        }),

        new SitemapPlugin(clientConfig.server.server_address, [
            { path: '/best/',           changefreq: 'daily',    priority: 0.8},
            { path: '/hot/',            changefreq: 'daily',    priority: 0.3},
            { path: '/top/',            changefreq: 'daily',    priority: 0.3},
            { path: '/new/',            changefreq: 'daily',    priority: 0.3},
            { path: '/controversial/',  changefreq: 'daily',    priority: 0.3},
            { path: '/rising/',         changefreq: 'daily',    priority: 0.3},
            { path: '/subs/',           changefreq: 'never',    priority: 0.9},
            { path: '/about/',          changefreq: 'never',    priority: 1.0},
            { path: '/privacy/',        changefreq: 'never',    priority: 0.3},
        ],
        {
            fileName: 'sitemap.xml'
        }),

        new RobotstxtPlugin(
        {
            policy: [
                {
                  userAgent: "*",
                  disallow: ["/api/", "/stats"],
                  crawlDelay: 2,
                }
              ],
            sitemap: clientConfig.server.server_address + "/sitemap.xml",
            host: clientConfig.server.server_address,

            filePath: 'robots.txt'
        }) 

    ]
}

export default config;