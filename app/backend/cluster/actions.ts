import * as cluster from 'cluster'
import * as Http from 'http';
import * as Net from 'net';
import { Action } from '~/common/models/Action';
import * as actionTypes from '~/backend/cluster/actionTypes'
import { LoginType } from '~/common/models/auth';
import * as redditAuth from '~/backend/authentication/redditAuth';
import { StatsCategoryType } from '~/common/models/stats';

export function addStatsEntry( category : StatsCategoryType, value: number )
{
    if (cluster.isMaster)
        return;

    let action : Action<actionTypes.stats.ADD_STATS> = {
        type: actionTypes.stats.ADD_STATS,
        payload: {
                category: category,
                value: value,
            },
        }

    process.send(action);

}

export function broadcastAuthState( identifier : string, expiresAt: number, loginType: LoginType, sourceWorker? : number )
{
    let action : Action<actionTypes.auth.ADD_AUTH_STATE> = {
        type: actionTypes.auth.ADD_AUTH_STATE,
        payload: {
                identifier: identifier,
                expiresAt: expiresAt,
                loginType: loginType,

                sourceWorker: sourceWorker  //Sometimes null
            },
        }

    //Master broadcasts to all workers except one that send it
    if (cluster.isMaster)
    {
        //Slave broadcasts to master
        for ( let id in cluster.workers)
        {
            let worker = cluster.workers[id];

            if (worker.id != sourceWorker)
                worker.send(action);
        }
    }
    else
    {
        action.payload.sourceWorker = cluster.worker.id;
        process.send( action );
    }
}

export function broadcastAuthStateRemoval( identifier : string, sourceWorker? : number )
{
    let action : Action<actionTypes.auth.REMOVE_AUTH_STATE> = {
        type: actionTypes.auth.REMOVE_AUTH_STATE,
        payload: {
                identifier: identifier,
                sourceWorker: sourceWorker  //Sometimes null
            },
        }

    //Master broadcasts to all workers except one that send it
    if (cluster.isMaster)
    {
        //Slave broadcasts to master
        for ( let id in cluster.workers)
        {
            let worker = cluster.workers[id];

            if (worker.id != sourceWorker)
                worker.send(action);
        }
    }
    else
    {
        action.payload.sourceWorker = cluster.worker.id;
        process.send( action );
    }
}

export function receiveAuthState( identifier : string, expiresAt: number, loginType: LoginType, sourceWorker : number )
{
    redditAuth.addAuthState(identifier, expiresAt, loginType);
}

export function receiveAuthStateRemoval( identifier : string, sourceWorker : number )
{
    redditAuth.removeAuthState(identifier);
}

export function UpgradeConnection( request : Http.IncomingMessage, socket : Net.Socket )
{
        //Hand to master so we don't have to deal with a lot of IPC routing.
        //Only pass the data we actually need, since the objects contain 
        //circular references and can't be stringified directly.
        let action : Action<actionTypes.websocket.UPGRADE_CONNECTION> = {
            type: actionTypes.websocket.UPGRADE_CONNECTION,
            payload: {
                request: { 
                    headers: request.headers, 
                    method: request.method, 
                    url: request.url, 
                    
                    connection: {
                        remoteAddress: request.connection.remoteAddress
                    } as any
                },
            }
        }

        socket.pause();
        process.send( action, socket );
}