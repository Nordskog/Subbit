import * as models from '~/common/models'
import * as urls from '~/common/urls'
import * as tools from '~/common/tools'
import { NetworkException } from '~/common/exceptions';


export async function getRequest<T>(url : string, parameters? : any, access_token?: string) : Promise<T>
{
    url = urls.RFY_API_URL + url;
    url = tools.url.appendUrlParameters(url,parameters);
    let options = getBackendFetchOptions('GET', access_token);

    let response;
    try
    {
        response = await fetch(url, options);
    }
    catch( err)
    {
        throw new NetworkException(null, err.message);
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

    let response;
    try
    {
        response = await fetch(url, options);
    }
    catch( err)
    {
        throw new NetworkException(null, err.message);
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

