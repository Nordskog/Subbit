import * as store from '~/client/store'
import * as models from '~/common/models'
import * as actions from '~/client/websocket/actionTypes'
import * as handlers from '~/client/websocket/handlers'
import { Exception } from '~/common/exceptions';

export function handleMessage( req : models.Action<any> )
{
    switch(req.type)
    {
        //////////////////////
        // General
        /////////////////////

        case actions.PONG:
        {
            handlers.notifyPong();
            break;
        }

        ////////////////////////////
        // Auth
        /////////////////////////////

        case actions.auth.AUTHENTICATED:
        {
            handlers.auth.notifyAuthenticated();
            break;
        }


        /////////////////////////////
        // Stats 
        /////////////////////////////

        case actions.stats.STATS_HISTORY:
        {
            handlers.stats.dispatchStatsHistory(req.payload);
            break;
        }

        case actions.stats.STATS_UPDATE:
        {
            handlers.stats.dispatchStatsUpdate(req.payload);
            break;
        }

        ////////////////////////////
        // Error
        ////////////////////////////

        case actions.errors.ERROR:
        {
            handlers.errors.handleError(req.payload);
            break;
        }

        default:
        {
            throw new Exception("Unknown action passed to client websocket:"+req.type);
        }
        
    }
}

export function listenersActive() : boolean
{
    //Loop through all handlers
    if (handlers.stats.active())
        return true;

    return false;
}

export function cleanUp()
{
    handlers.stats.setStatsCallbacks(null,null);
}