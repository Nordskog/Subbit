
let path = require('path');
let basePath = __dirname;

import clientConfig from '../config'

const HtmlWebpackPlugin = require('html-webpack-plugin');   //Something wrong with webpack typings
import * as Webpack from 'webpack';
import ExtractTextPlugin from "extract-text-webpack-plugin";
import TsconfigPathsPlugin  from 'tsconfig-paths-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
//import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import SitemapPlugin from 'sitemap-webpack-plugin';
import RobotstxtPlugin from 'robotstxt-webpack-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';

const config = {
    name: 'client',
    target: 'web',
    devtool: 'source-map',
    context: basePath,
    resolve: {
        extensions: [ '.ts', '.tsx', '.js', '.css', '.scss'],
        plugins: [new TsconfigPathsPlugin({ configFile: "webpack_tsconfig.json" })]

    },
    entry: {
        main: ['./client/index.tsx'],
        appStyles: [
            '../css/popup.scss',
            '../css/stats.scss',
            '../css/optionDropdown.scss',
            '../css/message.scss',
            '../css/animations.scss',
            '../css/toast.scss',
            '../css/userSettings.scss',
            '../css/toggle.scss',
            '../css/post.scss',
            '../css/header.scss',
            '../css/site.scss',
            '../css/author.scss',
            '../css/redditlist.scss',
            '../css/subredditList.scss',
            '../css/confirmationPopup.scss',
            'react-toastify/dist/ReactToastify.css'
        ],
    
    },
    output: {
        filename: 'static/[name].js',
        path: path.join(basePath, '../buildClient'), //Most stuff will go in static, root stuff moved to /buildClient
        publicPath: '/',
        chunkFilename: 'static/[name].js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'awesome-typescript-loader',
                options: {
                    useBabel: false,
                    configFileName : 'webpack_tsconfig.json'
                },
            },
            {
                test: /\.(gif|jpg|png)$/,
                include: /images/,
                loader: 'file-loader?name=static/[name].[ext]'
            },
            {
                test:/\.(scss)$/,
                use: ['extracted-loader'].concat( ExtractTextPlugin.extract(
                {
                    use: 
                    [

                        {
                            loader: 'typings-for-css-modules-loader',
                            options: {
                                modules: true,
                                localIdentName: '[name]-[local]',
                                namedExport: true
                            }
                        },

                        {
                            loader: 'postcss-loader',
                            options: {
                                
                            }
                        },     

                        {
                            loader: 'sass-loader'
                        },
                    ]
                }))             
            },
            {
                test:/\.(css)$/,
                use: ['extracted-loader'].concat( ExtractTextPlugin.extract(
                {
                    use: 
                    [

                {
                    loader: 'css-loader'
                }
                    ]
                }))
             
            },


            {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
            },
            {
                test:/\.(ico)$/,
                loader: 'file-loader?name=static/[name].[ext]'
            },
            
            {

                //SVGs loaded inline because compatibility (I'm looking at you, IE)
                test: /\.svg$/,
                exclude: [/node_modules/, /animations/],
                use: [
                    { 
                        loader: 'svg-inline-loader',

                        //Everything is styled by css
                        options: { removeTags: true }
                    }
              ]
            },

           {

            //Animted svgs are fancy and should use their own styles
            test: /\.(svg)$/,
            exclude: [/node_modules/, /images/],
            use: [
                    {
                        loader: 'svg-inline-loader',
                        options: {
                            name: 'static/[name].[ext]',
                        }
                    },
                ]
            },    
 
        ],
    },
    plugins: [
        new Webpack.NoEmitOnErrorsPlugin(),
        new Webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new ExtractTextPlugin('static/main.css', { allChunks: true }),
        new OptimizeCssAssetsPlugin(
        {
            cssProcessorOptions: { discardUnused: false }
        }),
        new HtmlWebpackPlugin( {
            template: "./index.html",
            filename: "index.html",
            inject: "body"
        }),
        new Webpack.NormalModuleReplacementPlugin(   //Replace nodejs log library with console output on client
            /rfyServerLogging.ts/,
            'rfyClientLogging.ts'
        ),
        new Webpack.NormalModuleReplacementPlugin(   //Replace nodejs log library with console output on client
            /rfyEnvServer.ts/,
            'rfyEnvClient.ts'
        ),
        //Merge Victory's ten-million lodash distros
        new LodashModuleReplacementPlugin({
            currying: true,
            flattening: true,
            paths: true,
            placeholders: true,
            shorthands: true
          }),
        new Webpack.DefinePlugin({
            "process.env.npm_package_version": JSON.stringify( process.env.npm_package_version)
          }),
        new UglifyJsPlugin(
        ), //Default config is pretty good
        //new BundleAnalyzerPlugin(),    //Enable me when you want stats

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
};

export default config;