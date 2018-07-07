import * as models from '~/common/models'
import * as urls from '~/common/urls'
import * as tools from '~/common/tools'
import { NetworkException, Exception } from '~/common/exceptions';
import { exceptions } from '~/common';


export async function getRequest<T>(url : string, parameters? : any, access_token?: string) : Promise<T>
{
    url = urls.RFY_API_URL + url;
    url = tools.url.appendUrlParameters(url,parameters);
    let options = getBackendFetchOptions('GET', access_token);

    //Stack trace in catch-block when using await is useless.
    //Grab actual stack trace here and append below.
    //Only necessary when creating a new exception in catch.
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

export async function postRequest<T, A>(url : string, request : models.Action<A>, access_token?: string) : Promise<T>
{
    url = urls.RFY_API_URL + url;
    let options = getBackendFetchOptions('POST', access_token);
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
        response = await fetch(url, options);
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

export function getBackendFetchOptions(method: string, access_token: string)
{
    let config;
    if (access_token)
    {
        config = {
            method: method,
            headers: {  'Content-Type': 'application/json', 'access_token': access_token }

        }
    }
    else
    {
        config = {
            method: method,
            headers: { 'Content-Type': 'application/json' },
        }
    }

    return config;
}

