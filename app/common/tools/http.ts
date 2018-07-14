import * as Http from 'http'

export function getReqIp( req : Http.IncomingMessage, isBehindReverseProxy : boolean )
{
    if (req == null)
        return 'null';

    if ( isBehindReverseProxy )
    {
        return ( <string>(req.headers['x-forwarded-for']) ).split(/\s*,\s*/)[0];
    }
    else
    {
        return req.connection.remoteAddress;
    }
}