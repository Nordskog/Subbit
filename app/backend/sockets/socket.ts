import * as WebSocket from 'ws'; 
import * as Http from 'http'
import * as handler from './handler'
import { handleException } from '~/backend/sockets/errors';

let server : WebSocket.Server = null;

interface WsSocket extends WebSocket
{
    isAlive : boolean;
}

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
        //Keep track of stale connections
        ws.isAlive = true;

        ws.on('pong', () =>
        {
            ws.isAlive = true;
        });

        ws.on('error', (err : Error) =>
        {
            console.log(err.message)
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


