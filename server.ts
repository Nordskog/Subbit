'use strict';

require('module-alias').addAlias("~", __dirname + "/app");

let debug = require('debug');
let path = require('path');

/////////////////
// Database
/////////////////

import * as RFY from '~/backend/rfy';
RFY.initDatabase();


////////////////
//Hot reload
////////////////
import * as webpack from 'webpack'
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware =  require('webpack-hot-middleware')
const webpackHotServerMiddleware =  require('webpack-hot-server-middleware')



/////////////////////
// Express backend
/////////////////////

import * as Express from 'express';
import * as cookieParser from 'cookie-parser'

import { render } from 'react-dom';

const bodyParser = require('body-parser');
const expressWetland = require('express-wetland');

var app: Express.Express = Express();

//Webpack configs
const clientConfig = require('./webpack_client');
const serverConfig = require('./webpack_server');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressWetland(RFY.wetland));



//Cookie parsing and jwt stuff
app.use(cookieParser());

// Resources for api
app.use(require('~/backend/resource/auth'));
app.use(require('~/backend/resource/subscription'));
app.use(require('~/backend/resource/user'));

const DEV = process.env.NODE_ENV === 'development'

//SSR
const publicPath = clientConfig.output.publicPath;
const outputPath = clientConfig.output.path;



if (DEV)
{
    console.log("Server configuration: DEV");

    let configs: webpack.Configuration[] = [clientConfig, serverConfig];
    const multiCompiler: webpack.MultiCompiler = webpack(configs )
    const clientCompiler = multiCompiler.compilers[0]

    app.use(webpackDevMiddleware(multiCompiler, { publicPath }))
    app.use(webpackHotMiddleware(clientCompiler))
    app.use(
        // keeps serverRender updated with arg: { clientStats, outputPath }
        webpackHotServerMiddleware(multiCompiler, {
            serverRendererOptions: { outputPath }
        })
    )
}
else
{
    console.log("Server configuration: PROD");

    const clientStats = require('./buildClient/stats.json') // eslint-disable-line import/no-unresolved
    const serverRender = require('./buildServer/main.js').default // eslint-disable-line import/no-unresolved

    console.log("Public path: ", publicPath);
    console.log("output path: ", outputPath);

    app.use(publicPath, Express.static(outputPath))
    app.use(serverRender({ clientStats, outputPath }))
}


///////////////////////////////////////////////////////////
// http to handle express and websockets on same port
//////////////////////////////////////////////////////////

import * as Http from 'http';
import * as Net from 'net';

const httpServer : Http.Server = Http.createServer();
httpServer.on('request', app);

/////////////////////////////////////////////////////////
// Fire up server
////////////////////////////////////////////////////

app.set('port', process.env.PORT || 8080);

httpServer.listen(app.get('port'), function () {
    debug('Server listening on port ' + httpServer.address().port);
});




/*
app.set('port', process.env.PORT || 8080);
var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
*/


