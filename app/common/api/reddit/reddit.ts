
import * as React from 'react';

import * as tools from '~/common/tools'

import * as fetch from 'isomorphic-fetch';

import * as models from '~/common/models';

import * as urls from '~/common/urls'

import config from 'root/config';
import { NetworkException, Exception } from '~/common/exceptions';

import { RateLimitCallback } from '~/common/tools/FetchQueue';
import { exceptions } from '~/common';

const apiQueue = new tools.FetchQueue(11);      // Will receive ratelimit header
const cdnQueue = new tools.FetchQueue(11);                                              // Will not receive ratelimit header

export function registerRatelimitCallbacks(  rateLimitCallback : RateLimitCallback, rateLimitedCallback : RateLimitCallback )
{
    apiQueue.registerRatelimitCallbacks( rateLimitCallback, rateLimitedCallback  );
}

export function clearQueue()
{
    apiQueue.clearQueue();
    cdnQueue.clearQueue();
}

export async function getRequest<T>(url : string, parameters? : any, auth?: models.auth.RedditAuth) : Promise<T>
{
    url = url;
    url = tools.url.appendUrlParameters(url,parameters);
    let options = getRedditFetchOptions('GET', auth);


    let response : Response;

    //Stack trace in catch-block when using await is useless.
    //Grab actual stack trace here and append below.
    //Only necessary when creating a new exception in catch.
    let stacktrace = new Error().stack;

    try
    {
        if (auth != null)
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
            let exception = new NetworkException(null, err.message, url);
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
        throw await NetworkException.fromResponse(response);
    }
}

export async function postRequest<T, A>(url : string, request : models.Action<A>, auth?: models.auth.RedditAuth) : Promise<T>
{
    url = url;
    let options = getRedditFetchOptions('POST', auth);
    options = {
        ...options,
        body: JSON.stringify(request)
    }

    //Stack trace in catch-block when using await is useless.
    //Grab actual stack trace here and append below.
    //Only necessary when creating a new exception in catch.
    let stacktrace = new Error().stack;

    let response;
    try
    {
        if (auth != null)
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
            let exception = new NetworkException(null, err.message, url);
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
        throw await NetworkException.fromResponse(response);
    }
}

export function getRedditFetchOptions( method : string, auth? : models.auth.RedditAuth )
{
    let options;
    if (auth != null)
    {
        options = {
            method: method,
            headers: { "Authorization" : 'bearer ' + auth.access_token,
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

    //Cors will be rejected if userAgent present in header, so don't do that on client.
    if (tools.env.isServer())
    {
        options = {
            ...options,
            headers: {
                ...options.headers,
                'User-Agent': tools.env.getUseragent(),
            }
        }
    }

    return options;

};







