import { Response, Request } from "express";
import { EndpointException, AuthorizationException, NetworkException, AuthorizationInvalidException, Exception } from "~/common/exceptions";
import * as stats from '~/backend/stats'
import * as Log from '~/common/log';

import * as authentication from '~/backend/authentication';

import serverConfig from 'root/server_config'
import * as tools from '~/common/tools';

async function getIdentity(req : Request, accessToken : string)
{
    let ip = tools.http.getReqIp(req, serverConfig.server.reverseProxy);
    let username = null;
    if (accessToken != null)
    {
        let accessTokenContent = await authentication.verification.getDecodedTokenWithoutVerifying(accessToken);
        username = accessTokenContent.sub;
    }

    if (username == null)
    {
        return `from ${ip}`;
    }
    else
    {
        return `by user ${username} from ${ip}`;
    }
}

async function formatException( exception : Error, req : Request, token : string)
{
    return `${exception.toString()} ${await getIdentity(req, token)} to endpoint ${req.originalUrl}` 
}

export async function handleException( exception : Error, req : Request, res : Response, token? : string)
{
    stats.add(stats.StatsCategoryType.ERRORS);
    
    //Most named exceptions will contain all the relevenat information, and don't need stack traces.
    if ( exception instanceof EndpointException )
    {
        //Respond to user with error and only log the message
        Log.I(await formatException(exception, req, token));
        res.status(exception.code).json( exception.message );
    }
    else if ( exception instanceof AuthorizationInvalidException )
    {
        Log.I(await formatException(exception, req, token));
        res.status(401).json( exception.message );
    }
    else if ( exception instanceof AuthorizationException )
    {
        Log.W(await formatException(exception, req, token));
        res.status(403).json( exception.message );
    }
    else if (exception instanceof NetworkException)
    {
        //Endpoint communicates with reddit when authenticating user and such.
        //For us this is usually very bad.
        Log.E(await formatException(exception, req, token));
        Log.E(exception);
        res.status(500).json( "Problem communicating with reddit:"+exception.message );
    }
    else
    {
       //Something went wrong that should not go wrong, log everything but don't share with user
       Log.E(await formatException(exception, req, token));
       Log.E(exception);
       res.sendStatus(500);
    }
}