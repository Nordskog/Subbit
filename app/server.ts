'use strict';

//Path configs that mirror those found in tsconfig
//because apparently ts-node ignores those
require('module-alias').addAlias("~", __dirname + "/");
require('module-alias').addAlias("css", __dirname + "/../css");
require('module-alias').addAlias("root", __dirname + "/../");


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

import { render } from 'react-dom';

const bodyParser = require('body-parser');
const expressWetland = require('express-wetland');

var app: Express.Express = Express();


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressWetland(RFY.wetland));

// Resources for api
app.use(require('~/backend/resource/auth'));
app.use(require('~/backend/resource/subscription'));
app.use(require('~/backend/resource/user'));

//////////////
// Webpack
//////////////
const DEV = process.env.NODE_ENV === 'development'

import clientConfig from './webpack_client'
import clientConfigDev from './webpack_client_dev'

const publicPath = clientConfig.output.publicPath;
const outputPath = clientConfig.output.path;

if (DEV)
{
    console.log("Server configuration: DEV");

    const clientCompiler = webpack(<any>clientConfigDev);

    app.use(webpackDevMiddleware(clientCompiler, { publicPath }))
    app.use(webpackHotMiddleware(clientCompiler))

    app.use('*', Express.static(outputPath))
}
else
{
    console.log("Server configuration: PROD");
    app.use(publicPath, Express.static(outputPath))

    //Anything that isn't api or a static resource gets routed to root
    app.use('*', Express.static(outputPath))
}


///////////////////////////////////////////////////////////
// http to handle express and websockets on same port
//////////////////////////////////////////////////////////

/*
const httpServer : Http.Server = Http.createServer();
httpServer.on('request', app);
*/
/////////////////////////////////////////////////////////
// Fire up server
////////////////////////////////////////////////////

import serverConfig from 'root/server_config'
app.listen(serverConfig.server.port, function () {
    debug('Server listening on port ' + app.get('port'));
});

