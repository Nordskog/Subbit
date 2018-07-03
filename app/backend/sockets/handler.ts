import * as WebSocket from 'ws'; 
import * as actionTypes from '~/backend/sockets/actionTypes'
import * as actions from '~/backend/sockets/actions';
import * as authentication from '~/backend/authentication'
import * as models from '~/common/models'
import * as handlers from '~/backend/sockets/handlers';
import * as statsTrackers from '~/backend/stats/trackers'
import * as socketSecurity from './security'
import * as Wetland from 'wetland';
import * as RFY from '~/backend/rfy'
import { Scope } from '~/backend/authentication/generation';
import { SocketException } from '~/common/exceptions';
import { handleException } from '~/backend/sockets/errors';



export async function handleSocketMessage( ws : WebSocket, message : WebSocket.Data )
{
    let rawReq : models.Action< any > = JSON.parse(<string>message);

    switch(rawReq.type)
    {
        //////////////////////////
        // General
        //////////////////////////

        case actionTypes.PING:
        {
            actions.pong(ws);
            break;
        }

        /////////////////////////////
        // Auth 
        /////////////////////////////

        case actionTypes.auth.AUTHENTICATE:
        {
            let manager : Wetland.Scope = RFY.wetland.getManager();

            let payload : actionTypes.auth.AUTHENTICATE = rawReq.payload;
            let scopes : Scope[] = await authentication.verification.getAuthenticatedScopes(manager, payload.access_token);

            socketSecurity.add(ws, ...scopes);

            actions.auth.dispatchAuthenticated(ws);

            break;
        }

        /////////////////////////////
        // Stats 
        /////////////////////////////

        case actionTypes.stats.SUBSCRIBE_TO_STATS:
        {
            socketSecurity.throwCheckAccess(ws, Scope.STATS);
            handlers.stats.addSubscriber(ws);
            break;
        }

        case actionTypes.stats.UNSUBSCRIBE_FROM_STATS:
        {
            socketSecurity.throwCheckAccess(ws, Scope.STATS);
            handlers.stats.removeSubscriber(ws);
            break;
        }

        case actionTypes.stats.REQUEST_STATS_HISTORY:
        {
            socketSecurity.throwCheckAccess(ws, Scope.STATS);
            let payload : actionTypes.stats.REQUEST_STATS_HISTORY = rawReq.payload;
            actions.stats.dispatchStatsHistory( statsTrackers.getHistory( payload.category, payload.timeRange) );

            break;
        }
        
        default:
        {
            handleException(new SocketException(`Unknown action requested: ${rawReq.type}`), ws );
        }
    }
}

export function cleanupSocket(ws : WebSocket)
{
    socketSecurity.remove(ws);
    handlers.stats.removeSubscriber(ws);
}