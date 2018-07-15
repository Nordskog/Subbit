import { Response, Request } from "express";
import { EndpointException, AuthorizationException, NetworkException, AuthorizationInvalidException, Exception } from "~/common/exceptions";
import * as stats from '~/backend/stats'
import * as Log from '~/common/log';

import * as authentication from '~/backend/authentication';

import serverConfig from 'root/server_config'
import * as tools from '~/common/tools';

async function getMeta( req : Request, accessToken : string)
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
        return { ip: ip, url: req.originalUrl }
    }
    else
    {
        return { ip: ip, user: username, url: req.originalUrl }
    }
}

export async function handleException( exception : Error, req : Request, res : Response, token? : string)
{
    stats.add(stats.StatsCategoryType.ERRORS);
    
    //Most named exceptions will contain all the relevenat information, and don't need stack traces.
    if ( exception instanceof EndpointException )
    {
        //Respond to user with error and only log the message
        Log.L(exception.severity, exception.toString(), await getMeta(req, token));
        res.status(exception.code).json( exception.message );
    }
    else if ( exception instanceof AuthorizationInvalidException )
    {
        Log.I(exception.toString(), await getMeta(req, token));
        res.status(401).json( exception.message );
    }
    else if ( exception instanceof AuthorizationException )
    {
        Log.W(exception.toString(), await getMeta(req, token));
        res.status(403).json( exception.message );
    }
    else if (exception instanceof NetworkException)
    {
        //Endpoint communicates with reddit when authenticating user and such.
        //For us this is usually very bad.
        Log.E(exception.toString(), await getMeta(req, token));
        Log.E(exception);   //Log separately for stack trace
        res.status(500).json( "Problem communicating with reddit:"+exception.message );
    }
    else
    {
       //Something went wrong that should not go wrong, log everything but don't share with user
       Log.E(exception.toString(), await getMeta(req, token));
       Log.E(exception);
       res.sendStatus(500);
    }
}