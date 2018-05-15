


import * as tools from '~/common/tools'

import * as fetch from 'isomorphic-fetch';

import * as models from '~/common/models';

import * as urls from '~/common/urls'

import * as config from '~/config';

const apiQueue = new tools.FetchQueue(11);   // Will receive ratelimit header
const cdnQueue = new tools.FetchQueue(11);   // Will not receive ratelimit header

export async function getRequest<T>(url : string, parameters? : any, auth?: models.auth.RedditAuth) : Promise<T>
{
    url = url;
    url = tools.url.appendUrlParameters(url,parameters);
    let options = getRedditFetchOptions('GET', auth);

    let response;
    if (auth != null)
        response = await apiQueue.enqueue( () => fetch(url, options) );
    else
        response = await cdnQueue.enqueue( () => fetch(url, options) );

    if (response.ok)
    {
        return await response.json();
    }
    else
    {
        return Promise.reject<T>(response);
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

    let response;
    if (auth != null)
        response = await apiQueue.enqueue( () => fetch(url, options) );
    else
        response = await cdnQueue.enqueue( () => fetch(url, options) );
        
    if (response.ok)
    {
        return await response.json();
    }
    else
    {
        return Promise.reject<T>(response);
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
            //'user-agent': config.name,
            //'Content-Type': 'application/json'
            }
        };
    }
    else
    {
        options = {
            method: method,
            headers: {
            //'user-agent': config.name,
            //'Content-Type': 'application/json'
            }
        };
    }

    return options;

};







