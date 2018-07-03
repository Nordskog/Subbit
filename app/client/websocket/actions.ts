// Where any external sources still register to communicate via the socket
import * as handlers from './handlers';
import * as socket from './socket';
import * as socketServerActions from '~/backend/sockets/actionTypes'
import * as models from '~/common/models'
import { Exception } from '~/common/exceptions';
import { StatsTimeRange, StatsCategoryType } from '~/common/models/stats';
import * as keepAlive from './keepAlive';


export function connect( access_token : string )
{
    socket.connect( access_token );
}

/////////////////////
// Stats
/////////////////////

export namespace stats
{
    export function registerForStats( updateCallback : handlers.stats.StatsUpdateCallback, historyCallback : handlers.stats.StatsHistoryCallback)
    {

        handlers.stats.setStatsCallbacks(updateCallback, historyCallback);

        let req : models.Action< socketServerActions.stats.SUBSCRIBE_TO_STATS > = 
        {
            type: socketServerActions.stats.SUBSCRIBE_TO_STATS,
            payload: {}
        }
        socket.send(req, true);
    }

    export function unregisterForStats( )
    {
        let req : models.Action< socketServerActions.stats.UNSUBSCRIBE_FROM_STATS > = 
        {
            type: socketServerActions.stats.UNSUBSCRIBE_FROM_STATS,
            payload: {}
        }
        socket.send(req, true);

        handlers.stats.setStatsCallbacks(null, null);
        socket.disconnectIfInactive();
    }

    export function requestHistory( category : StatsCategoryType,  timeRange : StatsTimeRange )
    {
        if ( !handlers.stats.active() )
            throw new Exception("Requested stats history without setting receiver listeners");

        let req : models.Action< socketServerActions.stats.REQUEST_STATS_HISTORY > = 
        {
            type: socketServerActions.stats.REQUEST_STATS_HISTORY,
            payload: 
            {
                category : category,
                timeRange : timeRange
            }
        }
        socket.send(req, true);
        
    }
}

////////////////////
// General
////////////////////

export function ping()
{
    let req : models.Action< socketServerActions.PING > = 
    {
        type: socketServerActions.PING,
        payload: {}
    }
    socket.send(req, false);
}

export function reconnect()
{
   socket.reconnect();
}

export function registerForConnectEvent( callback : models.WebsocketReconnectCallback  )
{
    socket.addConnectCallback(callback);
}

export function UnregisterForConnectEvent( callback : models.WebsocketReconnectCallback)
{
    socket.removeConnectCallback(callback);
}