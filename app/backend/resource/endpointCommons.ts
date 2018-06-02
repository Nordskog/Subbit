import { Response } from "express";
import { EndpointException, AuthorizationException, NetworkException } from "~/common/exceptions";

export function handleException( exception : Error, res : Response)
{
    if ( exception instanceof EndpointException )
    {
        //Respond to user with error and only log the message
        console.log( exception.message );
        res.status(exception.code).json( exception.message );
    }
    else if ( exception instanceof AuthorizationException )
    {
        console.log( exception.message );
        res.status(403).json( exception.message );
    }
    else if (exception instanceof NetworkException)
    {
        //Endpoint communicates with reddit when authenticating user and such. Might as well pass these along.
        console.log( exception );
        res.status(500).json( "Problem communicating with reddit:"+exception.message );
    }
    else
    {
       //Something went wrong that should not go wrong, log everything but don't share with user
       console.log( exception );
       res.sendStatus(500);
    }
}