import * as tools from '~/common/tools';

import fetch from 'isomorphic-fetch';

import * as models from '~/common/models';
import { NetworkRequestDomain } from '~/common/models';


import { NetworkException, Exception } from '~/common/exceptions';

import { RateLimitCallback } from '~/common/tools/FetchQueue';
import { exceptions } from '~/common';

import * as apiTools from './apiTools';

const apiQueue = new tools.FetchQueue(11);      // Will receive ratelimit header
const cdnQueue = new tools.FetchQueue(11);      // Will not receive ratelimit header

export function registerRatelimitCallbacks(  rateLimitCallback : RateLimitCallback, rateLimitedCallback : RateLimitCallback )
{
    apiQueue.registerRatelimitCallbacks( rateLimitCallback, rateLimitedCallback  );
}

export function clearQueue()
{
    apiQueue.clearQueue();
    cdnQueue.clearQueue();
}

export async function getRequest<T>(url : string, parameters? : object, auth?: models.auth.RedditAuth, headers? : any ) : Promise<T>
{
    url = url;
    url = tools.url.appendUrlParameters(url,parameters);
    let options = getRedditFetchOptions('GET', auth);

    // Replace header with input if present
    if (headers != null)
        options.headers = headers;

    let response : Response;

    // Stack trace in catch-block when using await is useless.
    // Grab actual stack trace here and append below.
    // Only necessary when creating a new exception in catch.
    let stacktrace = new Error().stack;

    try
    {
        if ( apiTools.authValid(auth) )
            response = await apiQueue.enqueue( () => fetch(url, options) );
        else
            response = await cdnQueue.enqueue( () => fetch(url, options) );
    }
    catch( err)
    {
        if (err instanceof Exception)  
            throw err;
        else
        {
            // Especially when working with cors, the browser does not provide
            // any useful information in this case.
            let exception = new NetworkException(null, "Could not connect to Reddit", url, null, NetworkRequestDomain.REDDIT);
            exceptions.appendStack(exception, stacktrace);
            throw exception;
        }
    }


    if (response.ok)
    {
        return await response.json();
    }
    else
    {
        throw await NetworkException.fromResponse(response, NetworkRequestDomain.REDDIT);
    }
}

export async function postRequest<T, A>(url : string, body : string | object, auth?: models.auth.RedditAuth, headers? : any ) : Promise<T>
{
    url = url;
    let options = getRedditFetchOptions('POST', auth);
    options = {
        ...options,
        body: typeof body === "string" ? body : JSON.stringify(body)
    };

    // Replace header with input if present
    if (headers != null)
        options.headers = headers;

    // Stack trace in catch-block when using await is useless.
    // Grab actual stack trace here and append below.
    // Only necessary when creating a new exception in catch.
    let stacktrace = new Error().stack;

    let response;
    try
    {
        if ( apiTools.authValid(auth) )
            response = await apiQueue.enqueue( () => fetch(url, options) );
        else
            response = await cdnQueue.enqueue( () => fetch(url, options) );
    }
    catch( err)
    {
        if (err instanceof Exception)  
            throw err;
        else
        {
            // Especially when working work cors, the browser does not provide
            // any useful information in this case.
            let exception = new NetworkException(null, "Could not connect to Reddit", url, null, NetworkRequestDomain.REDDIT);
            exceptions.appendStack(exception, stacktrace);
            throw exception;
        }
    }

        
    if (response.ok)
    {
        return await response.json();
    }
    else
    {
        throw await NetworkException.fromResponse(response, NetworkRequestDomain.REDDIT);
    }
}

export function getRedditFetchOptions( method : string, auth? : models.auth.RedditAuth )
{
    let options;
    if ( apiTools.authValid(auth) )
    {
        options = {
            method: method,
            headers: { Authorization : 'bearer ' + auth.access_token,
            }
        };
    }
    else
    {
        options = {
            method: method,
            headers: {
            }
        };
    }

    // Cors will be rejected if userAgent present in header, so don't do that on client.
    if (tools.env.isServer())
    {
        options = {
            ...options,
            headers: {
                ...options.headers,
                'User-Agent': tools.env.getUseragent(),
            }
        };
    }

    return options;

}







