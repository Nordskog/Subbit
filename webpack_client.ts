
let path = require('path');
let basePath = __dirname;

let HtmlWebpackPlugin = require('html-webpack-plugin');
let webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')


const config = {
    name: 'client',
    target: 'web',
    devtool: 'source-map',
    context: basePath,
    resolve: {
        extensions: [ '.ts', '.tsx', '.js', '.css', '.scss'],
        plugins: [new TsconfigPathsPlugin({ configFile: "tsconfig.json" })]

    },
    entry: {
        main: ['./app/client/index.tsx'],
        appStyles: [

            './css/toast.scss',
            './css/userSettings.scss',
            './css/toggle.scss',
            './css/post.scss',
            './css/header.scss',
            './css/site.scss',
            './css/author.scss',
            './css/redditlist.scss',
            './css/subredditList.scss',
            './css/confirmationPopup.scss',
            'react-toastify/dist/ReactToastify.css'
        ],
        vendor: [
            'react',
            'react-dom',
            'redux',
            'redux-first-router',
            'redux-first-router-link',
            'history/createBrowserHistory',
            'redux-thunk',
            'react-redux',
            'react-toastify'
        ]
    },
    output: {
        filename: '[name].js',
        path: path.join(basePath, './buildClient'),
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
                },
            },
            {
                test: /\.(gif|jpg|png)$/,
                include: path.join(basePath, "./assets/images"),
                loader: 'url-loader?limit=100000'
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
                    },
                    ]
                }))
             
            },
            // Loading glyphicons => https://github.com/gowravshekar/bootstrap-webpack
            // Using here url-loader and file-loader
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
                //test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                test: /\.(svg)$/,
                exclude: /assets/,
                loader: 'url-loader?limit=10&mimetype=image/svg+xml'
            },
            
            // webpack >= 2
            {
                test: /\.svg$/,
                exclude: /node_modules/,
                use: [
                    { 
                        loader: 'svg-sprite-loader',
                        options: { extract: true, esModule: true }
                    }
              ]
              }
            
        ],
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        //new StatsPlugin('stats.json'),
        new SpriteLoaderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new ExtractTextPlugin('main.css', { allChunks: true }),
        new HtmlWebpackPlugin( {
        template: "./index.html",
        filename: "index.html",
        inject: "body"
        }),
        new UglifyJsPlugin() //Default config is pretty good


    ]
};

export default config;