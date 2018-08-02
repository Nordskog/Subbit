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

import Webpack from 'webpack'

import Express from 'express';

import * as stats from '~/backend/stats'

import * as Http from 'http';
import * as Net from 'net';

import * as socket from '~/backend/sockets'
import * as WebSocket from 'ws'

import * as Log from '~/common/log';

const bodyParser = require('body-parser');
const expressWetland = require('express-wetland');

import serverConfig from 'root/server_config'

import clientConfig from './webpack_client'
import clientConfigDev from './webpack_client_dev'

import * as cluster from 'cluster'
import { Action } from '~/common/models';

import * as clusterActions from '~/backend/cluster/'

const DEV = process.env.NODE_ENV === 'development'

async function setupMain()
{


    ////////////////
    // Logging
    /////////////////

    Log.init(true, DEV);

    /////////////////
    // Database
    /////////////////

    await RFY.initDatabase();

    /////////////////
    // Stuff
    /////////////////

    Log.I("Starting master "+process.pid);

    if (DEV)
        Log.I("Server configuration: DEV");
    else
        Log.I("Server configuration: PROD");
    
    ///////////////////
    // Stats tracking
    ///////////////////

    await setup.stats.setup();

    //////////////////////
    // Websocket
    //////////////////////

    //Because there's a lot of back-and-forth, websocket stuff
    //is all handled on master.
    let managerSocket : WebSocket.Server = socket.getServer();

    //////////////////
    // Fork slaves
    //////////////////

    let cpus = require('os').cpus().length;
    if (DEV)
    {
        //Limit to single core when dev
        cpus = 1;
    }

    Log.I(`Will spawn ${cpus} slaves`);

    clusterActions.spawnSlaves(managerSocket, cpus);
}

async function setupSlave()
{

    ////////////////
    // Logging
    /////////////////

    Log.init(false);

    Log.I(`Starting slave #${cluster.worker.id} at ${process.pid}`);

    /////////////////
    // Database
    /////////////////

    await RFY.initDatabase();

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
    const publicPath = clientConfig.output.publicPath;
    const outputPath = clientConfig.output.path;

    if (DEV)
    {
        const clientCompiler = Webpack(<any>clientConfigDev);

        app.use(webpackDevMiddleware(clientCompiler, { publicPath }))
        app.use(webpackHotMiddleware(clientCompiler))

        app.use('*', Express.static(outputPath))
    }
    else
    {
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

    //Handle separate websockets for manager / client
    httpServer.on('upgrade', (request : Http.IncomingMessage, socket : Net.Socket, head : Buffer) => 
    {
        clusterActions.UpgradeConnection(request, socket);
    });

    //////////////////////////////
    // Messages from master
    //////////////////////////////

    process.on( 'message', ( message : Action<any>, handle : Net.Socket | Net.Server  ) => 
    {            
        if (message != null)
        {
            switch(message.type)
            {
                case clusterActions.actionTypes.auth.ADD_AUTH_STATE:
                {
                    let payload : clusterActions.actionTypes.auth.ADD_AUTH_STATE = message.payload;
                    clusterActions.receiveAuthState(payload.identifier, payload.expiresAt, payload.loginType, payload.sourceWorker );
                    break;
                }

                case clusterActions.actionTypes.auth.REMOVE_AUTH_STATE:
                {
                    let payload : clusterActions.actionTypes.auth.REMOVE_AUTH_STATE = message.payload;
                    clusterActions.receiveAuthStateRemoval(payload.identifier, payload.sourceWorker );
                    break;
                }
            }
        }
    });

    /////////////////////////////////////////////////////////
    // Fire up server
    ////////////////////////////////////////////////////

    app.set('port', serverConfig.server.port);

    httpServer.listen(app.get('port'), function () {
        debug('Server listening on port ' + httpServer.address().port);
    });
}

if (cluster.isMaster)
{
    setupMain();
}
else
{
    setupSlave();
}



