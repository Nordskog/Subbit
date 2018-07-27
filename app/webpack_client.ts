
let path = require('path');
let basePath = __dirname;

let HtmlWebpackPlugin = require('html-webpack-plugin');
import * as Webpack from 'webpack';
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

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
        filename: '[name].js',
        path: path.join(basePath, '../buildClient'),
        publicPath: '/static/'
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
                loader: 'file-loader'
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
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader'
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
                            name: '[name].[ext]',
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
        new ExtractTextPlugin('main.css', { allChunks: true }),
        new HtmlWebpackPlugin( {
            favicon: '../assets/images/favicon.ico',
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
        //new BundleAnalyzerPlugin()
    ]
};

export default config;