import * as WebSocket from 'ws'; 
import * as Http from 'http'
import * as handler from './handler'
import * as listeners from './listeners'

import * as sockets from '~/backend/sockets'

let server : WebSocket.Server = null;

function init(httpServer : Http.Server)
{
    
    server = new WebSocket.Server(
        {
            noServer : true
        });
    

    server.on('connection', (ws : WebSocket ) => 
    {
        console.log("Connected!");

        ws.on('error', (err : Error) =>
        {
            console.log(err.message)
        });

        ws.on('close', () => 
        {
            listeners.removeSubscriber(ws);
        });

        ws.on('message', (message : WebSocket.Data ) => 
        {
            handler.handleSocketMessage(ws, message);
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



