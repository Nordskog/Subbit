import * as models from '~/common/models';
import * as urls from '~/common/urls';
import * as tools from '~/common/tools';
import { NetworkException, Exception } from '~/common/exceptions';
import { exceptions } from '~/common';
import config from 'root/config';
import fetch from 'isomorphic-fetch';
import { NetworkRequestDomain } from '~/common/models';

export async function getRequest<T>(url : string, parameters? : any, accessToken?: string) : Promise<T>
{
    url = urls.RFY_API_URL + url;
    url = tools.url.appendUrlParameters(url,parameters);
    let options = getBackendFetchOptions('GET', accessToken);

    // Stack trace in catch-block when using await is useless.
    // Grab actual stack trace here and append below.
    // Only necessary when creating a new exception in catch.
    let stacktrace = new Error().stack;

    let response;
    try
    {
        response = await fetch(url, options);
    }
    catch( err)
    {
        if (err instanceof Exception)  
            throw err;
        else
        {
            // Browser does not provide any useful information.
            let exception = new NetworkException(null, "Could not contact " + config.client.siteName + " server", url, null, NetworkRequestDomain.SUBBIT);
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
        throw await NetworkException.fromResponse(response, NetworkRequestDomain.SUBBIT);
    }
}

export async function postRequest<T, A>(url : string, request : models.Action<A>, accessToken?: string) : Promise<T>
{
    url = urls.RFY_API_URL + url;
    let options = getBackendFetchOptions('POST', accessToken);
    options = {
        ...options,
        body: JSON.stringify(request)
    };

    // Stack trace in catch-block when using await is useless.
    // Grab actual stack trace here and append below.
    // Only necessary when creating a new exception in catch.
    let stacktrace = new Error().stack;

    let response;
    try
    {
        response = await fetch(url, options);
    }
    catch( err)
    {
        if (err instanceof Exception)  
            throw err;
        else
        {
            // Browser does not provide any useful information.
            let exception = new NetworkException(null, "Could not contact " + config.client.siteName + " server", url, null, NetworkRequestDomain.SUBBIT);
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
        throw await NetworkException.fromResponse(response, NetworkRequestDomain.SUBBIT);
    }
}

export function getBackendFetchOptions(method: string, accessToken: string)
{
    let config;
    if (accessToken)
    {
        config = {
            method: method,
            headers: {  'Content-Type': 'application/json', 
                        'access_token': accessToken ,
                        'User-Agent': tools.env.getUseragent(),
        }

        };
    }
    else
    {
        config = {
            method: method,
            headers: {  'Content-Type': 'application/json',
                        'User-Agent': tools.env.getUseragent(),
                    },
        };
    }

    return config;
}

