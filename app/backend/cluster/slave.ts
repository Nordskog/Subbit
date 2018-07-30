import * as WebSocket from 'ws'
import * as clusterActionTypes from '~/backend/cluster/actionTypes'
import * as cluster from 'cluster'
import * as Http from 'http';
import * as Net from 'net';
import { Action } from '~/common/models';
import * as Log from '~/common/log';

let lastDeath : number = 0;

function forkSlave( managerSocket : WebSocket.Server )
{
    let worker : cluster.Worker = cluster.fork();
    worker.on( 'error', ( error : Error) => 
    {
        Log.E(error);
    });

    worker.on( 'exit', () => 
    {
        //Delay if last death occurred less than 30 seconds ago.
        if ( Date.now() - lastDeath < 1000 * 30 )
        {
            Log.I(`Slave ${worker.id} exited. Restarting in 30 seconds`);
            setTimeout( () => { forkSlave(managerSocket); }, 1000 * 30);
        }
        else
        {
            Log.I(`Slave ${worker.id} exited. Restarting.`);
            forkSlave(managerSocket);
        }

        lastDeath = Date.now();
    });

    ////////////////////////////////////
    // Deal with requests from slaves
    ////////////////////////////////////

    worker.on( 'message', ( message : Action<any>, handle : Net.Socket | Net.Server  ) => 
    {            
        if (message != null)
        {
            switch(message.type)
            {
                case clusterActionTypes.websocket.UPGRADE_CONNECTION:
                {
                    let payload : clusterActionTypes.websocket.UPGRADE_CONNECTION = message.payload;
                    handle = handle as Net.Socket;
                    handle.resume();

                    managerSocket.handleUpgrade( payload.request as Http.IncomingMessage,handle, [] as any, function done(ws) 
                    {
                        managerSocket.emit('connection', ws, payload.request);
                    });
                    break;
                }

                case clusterActionTypes.log.LOG:
                {
                    let payload : clusterActionTypes.log.LOG = message.payload;
                    Log.L(payload.severity, payload.msg, payload.meta)
                    break;
                }
            }
        }
    });
}

export function spawnSlaves( managerSocket : WebSocket.Server, slaveCount : number)
{
    for (let i = 0; i < slaveCount; i += 1) 
    {
        forkSlave(managerSocket);
    }
}