'use strict';

//Path configs that mirror those found in tsconfig
//because apparently ts-node ignores those
require('module-alias').addAlias("~", __dirname + "/");
require('module-alias').addAlias("css", __dirname + "/../css");
require('module-alias').addAlias("root", __dirname + "/../");


let debug = require('debug');
let path = require('path');

//More stuff should probably be moved into separate modulesl 
import * as setup from '~/setup'


import * as RFY from '~/backend/rfy';

import * as webpack from 'webpack'

import * as Express from 'express';

import * as stats from '~/backend/stats'

import * as Http from 'http';
import * as Net from 'net';

import * as socket from '~/backend/sockets'
import * as WebSocket from 'ws'

const bodyParser = require('body-parser');
const expressWetland = require('express-wetland');

import serverConfig from 'root/server_config'

import clientConfig from './webpack_client'
import clientConfigDev from './webpack_client_dev'

async function setupMain()
{
    /////////////////
    // Database
    /////////////////

    await RFY.initDatabase();

    ///////////////////
    // Stats tracking
    ///////////////////
    setup.stats.setup();

    ////////////////
    //Hot reload
    ////////////////

    const webpackDevMiddleware = require('webpack-dev-middleware')
    const webpackHotMiddleware =  require('webpack-hot-middleware')
    const webpackHotServerMiddleware =  require('webpack-hot-server-middleware')

    /////////////////////
    // Express backend
    /////////////////////




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
    // Serving webpack output
    //////////////
    const DEV = process.env.NODE_ENV === 'development'



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

        //All static resources
        app.use(publicPath, Express.static(outputPath));

        //Html will fetch favicon from static, but this will still receive requests
        app.get('/favicon.ico', function(req, res){
            res.sendFile( path.join(outputPath, "favicon.ico") );
        });

        //Anything else gets app container
        app.get('/*', function(req, res)
        {
            //Anything that hits this counts as a pageload I guess
            //Note that this will be omitted when running in dev mode
            //as it doesn't have a separate path.
            stats.add(stats.StatsCategoryType.PAGE_LOADS);
            res.sendFile( path.join(outputPath, "index.html") );
        });

    }


    ///////////////////////////////////////////////////////////
    // http to handle express and websockets on same port
    //////////////////////////////////////////////////////////


    const httpServer : Http.Server = Http.createServer();
    httpServer.on('request', app);

    ///////////////////////////////
    // WebSocket
    ///////////////////////////////

    let managerSocket : WebSocket.Server = socket.getServer(httpServer);

    //Handle separate websockets for manager / client
    httpServer.on('upgrade', (request : Http.IncomingMessage, socket : Net.Socket, head : Buffer) => {

        console.log(request.url);

        //if (request.url === '/api/socket/manager') 
        {
            managerSocket.handleUpgrade(request, socket, head, function done(ws) 
            {
                managerSocket.emit('connection', ws);
            });
        } 
        //else
        {
        //socket.destroy();
        }
    });

    /////////////////////////////////////////////////////////
    // Fire up server
    ////////////////////////////////////////////////////


    app.set('port', serverConfig.server.port);

    httpServer.listen(app.get('port'), function () {
        debug('Server listening on port ' + httpServer.address().port);
    });


    /*
    app.listen(serverConfig.server.port, function () {
        debug('Server listening on port ' + app.get('port'));
    });
    */
}

setupMain();

