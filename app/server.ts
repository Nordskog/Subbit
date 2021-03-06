﻿'use strict';

// Path configs that mirror those found in tsconfig
// because apparently ts-node ignores those
import moduleAlias from 'module-alias';
moduleAlias.addAlias("~", __dirname + "/");
moduleAlias.addAlias("css", __dirname + "/../css");
moduleAlias.addAlias("root", __dirname + "/../");

import path from 'path';

// More stuff should probably be moved into separate modulesl 
import * as setup from '~/setup';

import * as stats from '~/backend/stats';

import Webpack from 'webpack';

import Express from 'express';

import * as Http from 'http';
import * as Net from 'net';

import * as socket from '~/backend/sockets';
import * as WebSocket from 'ws';

import * as api from '~/common/api';

import * as Log from '~/common/log';

import bodyParser from 'body-parser';

import serverConfig from 'root/server_config';

import clientConfig from './webpack_client';
import clientConfigDev from './webpack_client_dev';

import * as cluster from 'cluster';
import { Action } from '~/common/models';

import * as clusterActions from '~/backend/cluster/';

import os from 'os';

import * as routers from '~/backend/resource';

import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import historyApiFallback from 'connect-history-api-fallback';

const DEV = process.env.NODE_ENV === 'development';

async function setupMain()
{
    ////////////////
    // Logging
    /////////////////

    await setup.log.setup( DEV );

    ////////////////////
    // We're alive!
    ////////////////////

    Log.I("Starting master " + process.pid);

    if (DEV) 
        Log.I("Server configuration: DEV");
    else
        Log.I("Server configuration: PROD");

    ///////////////////////////////////////
    // Database, stats
    ///////////////////////////////////////

    await setup.database.setup();
    await setup.stats.setup();

    //////////////////////
    // Websocket
    //////////////////////

    // Because there's a lot of back-and-forth, websocket stuff
    // is all handled on master.
    let managerSocket: WebSocket.Server = socket.getServer();

    //////////////////
    // Fork slaves
    //////////////////

    let cpus = os.cpus().length;
    if (DEV)
    {
        // Limit to single core when dev
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

    await setup.log.setup();

    Log.I(`Starting slave #${cluster.worker.id} at ${process.pid}`);

    ///////////////////////////////////////
    // Database, stats, reddit auth
    ///////////////////////////////////////

    await setup.database.setup();
    await setup.auth.setup();

    /////////////////
    // Api 
    /////////////////

    // Unlike on the client, we reject any new connections if reddit's ratelimit has been hit.
    // The user can wait around if they hit their own rate limit, but won't wait for us.
    api.reddit.setApiRejectOnRateLimit(true);

    /////////////////////
    // Express backend
    /////////////////////
    let app: Express.Express = Express();

    // Catch-all for requests stats
    app.use( (req, res, next) => 
    {
        stats.add( stats.StatsCategoryType.REQUESTS );
        next();
    });

    // Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Resources for api
    app.use(routers.authRouter);
    app.use(routers.subscriptionRouter);
    app.use(routers.userRouter);

    //////////////
    // Serving webpack output
    //////////////
    const publicPath = clientConfig.output.publicPath;
    const outputPath = clientConfig.output.path;

    if (DEV)
    {
        const clientCompiler = Webpack(<any> clientConfigDev);

        app.use(historyApiFallback( {   verbose: false  }));    // Handles catch-all route
        app.use(webpackDevMiddleware(clientCompiler, { publicPath: publicPath } ) );
        app.use(webpackHotMiddleware(clientCompiler));
    }
    else
    {
        // Index, robots, sitemap, favicon in root.
        // Static resources in /static
        app.use(Express.static( outputPath ));

        // Catch-all route for app container
        app.get('*', (req, res) =>
        {
            res.sendFile( path.join(outputPath, "index.html") );
        });
    }

    ///////////////////////////////////////////////////////////
    // http to handle express and websockets on same port
    //////////////////////////////////////////////////////////

    const httpServer: Http.Server = Http.createServer();
    httpServer.on('request', app);

    ///////////////////////////////
    // WebSocket
    ///////////////////////////////

    // Handle separate websockets for manager / client
    httpServer.on('upgrade', (request: Http.IncomingMessage, socket: Net.Socket, head: Buffer) => 
    {
        if (request.url === '/api/socket')
        {
            clusterActions.UpgradeConnection(request, socket);
        }
    });

    //////////////////////////////
    // Messages from master
    //////////////////////////////

    process.on( 'message', ( message: Action<any>, handle: Net.Socket | Net.Server  ) => 
    {            
        if (message != null)
        {
            switch(message.type)
            {
                case clusterActions.actionTypes.auth.ADD_AUTH_STATE:
                {
                    let payload: clusterActions.actionTypes.auth.ADD_AUTH_STATE = message.payload;
                    clusterActions.receiveAuthState(payload.identifier, payload.expiresAt, payload.loginType, payload.sourceWorker );
                    break;
                }

                case clusterActions.actionTypes.auth.REMOVE_AUTH_STATE:
                {
                    let payload: clusterActions.actionTypes.auth.REMOVE_AUTH_STATE = message.payload;
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

    httpServer.listen(app.get('port'), () => {
        Log.I('Server listening on port ' + httpServer.address().port);
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



