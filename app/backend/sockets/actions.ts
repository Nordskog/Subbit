import * as handlers from './handlers';
import { StatsHistory, StatsUpdate } from '~/common/models/stats';
import * as clientSocketActions from '~/client/websocket/actionTypes';
import { Action } from '~/common/models';
import { NoErrorsPlugin } from 'webpack';
import * as WebSocket from 'ws'; 

//////////////////
// Auth
//////////////////

export namespace auth 
{
    export function dispatchAuthenticated( ws : WebSocket )
    {
        let action : Action<clientSocketActions.auth.AUTHENTICATED> = {
            type: clientSocketActions.auth.AUTHENTICATED,
            payload: {}
        }

        ws.send( JSON.stringify( action  ) );
    }
}

//////////////////
// Stats
//////////////////

export namespace stats
{
    export function dispatchStatsUpdate( data : StatsUpdate )
    {
        let action : Action<clientSocketActions.stats.STATS_UPDATE> = {
            type: clientSocketActions.stats.STATS_UPDATE,
            payload: data
        }

        handlers.stats.dispatch(action);
    }

    export function dispatchStatsHistory( history : StatsHistory )
    {
        let action : Action<clientSocketActions.stats.STATS_HISTORY> = {
            type: clientSocketActions.stats.STATS_HISTORY,
            payload: history
        }

        handlers.stats.dispatch(action);
    }
}

///////////////////
// Errors
///////////////////

export namespace errors 
{
    export function sendError( ws : WebSocket, message : string )
    {
        let action : Action<clientSocketActions.errors.ERROR> = {
            type: clientSocketActions.errors.ERROR,
            payload: { message : message}
        }

        if (ws != null)
            ws.send( JSON.stringify( action  ) );
    }
}

//////////////
// General
/////////////

export function pong( ws : WebSocket)
{
    let action : Action<clientSocketActions.PONG> = {
        type: clientSocketActions.PONG,
        payload: {}
    }

    if (ws != null)
        ws.send( JSON.stringify( action  ) );
}