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

export function setApiRejectOnRateLimit( enabled : boolean )
{
    apiQueue.setRejectOnRateLimit(enabled);
}

export function clearQueue()
{
    apiQueue.clearQueue();
    cdnQueue.clearQueue();
}

export async function getRequest<T>(url : string, parameters? : object, auth?: models.auth.RedditAuth, additionalOptions? : object, additionalHeaders? : object ) : Promise<T>
{
    url = url;
    url = tools.url.appendUrlParameters(url,parameters);
    let options = getRedditFetchOptions('GET', auth, additionalOptions, additionalHeaders);

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
        let exception = await NetworkException.fromResponse(response, NetworkRequestDomain.REDDIT);
        exceptions.appendStack(exception, stacktrace);
    }
}

export async function postRequest<T, A>(url : string, body : string | object, auth?: models.auth.RedditAuth, additionalOptions? : object, additionalHeaders? : object ) : Promise<T>
{
    url = url;
    let options = getRedditFetchOptions('POST', auth, additionalOptions, additionalHeaders);
    options = {
        ...options,
        body: typeof body === "string" ? body : JSON.stringify(body)
    };


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

        // Most valid Reddit post requests always return a 200, with a json object containing any errors
        // Check for that, and return as any so whoever called can decide what it should be.
        let responseBody : models.reddit.PostRequestResponse = await response.json();
        if (responseBody.json != null)
        {
            if ( responseBody.json.errors != null )
            {
                if (responseBody.json.errors.length > 0)
                {
                    // There may be multiple errors, but just deal with the first one for now.
                    // Each error consists of 3 strings, enum, human readable, relevant param.
                    let exception = new NetworkException(null, responseBody.json.errors[0][1], url, null, NetworkRequestDomain.REDDIT);
                    exceptions.appendStack(exception, stacktrace);
                    throw exception;
                }
            }
        }
        return responseBody as any;
    }
    else
    {
        let exception = await NetworkException.fromResponse(response, NetworkRequestDomain.REDDIT);
        exceptions.appendStack(exception, stacktrace);
        throw exception;
    }
}

export function getRedditFetchOptions( method : string, auth? : models.auth.RedditAuth, additionalOptions? : object, additionalHeaders? : object )
{
    if (additionalHeaders === null)
        additionalHeaders = {};

    if (additionalOptions === null)
        additionalOptions = {};

    let options;
    if ( apiTools.authValid(auth) )
    {
        options = {
            method: method,
            headers: {
                 Authorization : 'bearer ' + auth.access_token,
                 ...additionalHeaders
            },
            ...additionalOptions
        };
    }
    else
    {
        options = {
            method: method,
            headers: {
                ...additionalHeaders
            },
            ...additionalOptions
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
                ...additionalHeaders
            },
            ...additionalOptions
        };
    }

    return options;

}







