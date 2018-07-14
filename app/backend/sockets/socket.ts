import * as WebSocket from 'ws'; 
import * as Http from 'http'
import * as handler from './handler'
import * as tools from '~/common/tools'
import serverConfig from 'root/server_config'
import { handleException } from '~/backend/sockets/errors';
import * as Log from '~/common/log';
import { WsSocket } from './models';

let server : WebSocket.Server = null;

function init(httpServer : Http.Server)
{
    
    ////////////////////////
    // Server
    ///////////////////////
    server = new WebSocket.Server(
        {
            noServer : true
        });

    //////////////////////////
    // Connection ping-pong
    //////////////////////////
    
    let interval : number = 1000 * 60; //1 minute
    setInterval( () => 
    {
        for ( let ws  of server.clients)
        {
            let wsSocket : WsSocket = ws as WsSocket;
            if (!wsSocket.isAlive)
            {
                wsSocket.terminate();
            }
            else
            {
                wsSocket.isAlive = false;
                wsSocket.ping( () => {} );
            }
        }

    }, interval);



    //////////////////////////
    // Handle stuff
    //////////////////////////

    server.on('connection', (ws : WsSocket, req : Http.IncomingMessage ) => 
    {
        ws.ip = tools.http.getReqIp(req, serverConfig.server.reverseProxy );
        Log.A(`Websocket connection`, null, ws.ip);

        //Keep track of stale connections
        ws.isAlive = true;

        ws.on('pong', () =>
        {
            ws.isAlive = true;
        });

        ws.on('error', (err : Error) =>
        {
            //TODO deal with socket errors, get them even on clean disconnects.
        });

        ws.on('close', () => 
        {
            handler.cleanupSocket(ws);
        });

        ws.on('message', async (message : WebSocket.Data ) => 
        {
            try
            {
                await handler.handleSocketMessage(ws, message);
            }
            catch ( err )
            {
                handleException(err, ws);
            }
        } );


    });
}

export function getServer( httpServer : Http.Server )
{
    if (server == null)
    {
        init(httpServer);
    }

    return server;
}



