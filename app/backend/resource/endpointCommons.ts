import { Response } from "express";
import { EndpointException, AuthorizationException, NetworkException, AuthorizationInvalidException } from "~/common/exceptions";
import * as stats from '~/backend/stats'
import * as Log from '~/common/log';

export function handleException( exception : Error, res : Response)
{
    stats.add(stats.StatsCategoryType.ERRORS);
    
    if ( exception instanceof EndpointException )
    {
        //Respond to user with error and only log the message
        Log.I(exception.toString());
        res.status(exception.code).json( exception.message );
    }
    else if ( exception instanceof AuthorizationInvalidException )
    {
        Log.I(exception.toString());
        res.status(401).json( exception.message );
    }
    else if ( exception instanceof AuthorizationException )
    {
        Log.W(exception.toString());
        res.status(403).json( exception.message );
    }
    else if (exception instanceof NetworkException)
    {
        //Endpoint communicates with reddit when authenticating user and such.
        //For us this is usually very bad.
        Log.E(exception);
        res.status(500).json( "Problem communicating with reddit:"+exception.message );
    }
    else
    {
       //Something went wrong that should not go wrong, log everything but don't share with user
       Log.E(exception);
       res.sendStatus(500);
    }
}