
import {  AuthorizationException, SocketException, Exception } from "~/common/exceptions";
import * as WebSocket from 'ws'; 
import * as stats from '~/backend/stats'
import * as actions from './actions'
import * as Log from '~/common/log';


export function handleException( exception : Error, ws : WebSocket)
{
    stats.add(stats.StatsCategoryType.ERRORS);
    
    if ( exception instanceof Exception  )
    {
        //Respond to user with error and only log the message
        Log.E( exception.toString() );
        actions.errors.sendError(ws, exception.message);
    }
    else
    {
       //Something went wrong that should not go wrong, log everything but don't share with user
       Log.E( exception );
       actions.errors.sendError(ws, "Something went wrong");
    }
}