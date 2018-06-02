import * as models from '~/common/models'
import * as urls from '~/common/urls'
import * as tools from '~/common/tools'
import { NetworkException } from '~/common/exceptions';


export async function getRequest<T>(url : string, parameters? : any, access_token?: string) : Promise<T>
{
    url = urls.API_URL + url;
    url = tools.url.appendUrlParameters(url,parameters);
    let options = getBackendFetchOptions('GET', access_token);

    let response = await fetch(url, options);
    
    if (response.ok)
    {
        return await response.json();
    }
    else
    {
        return Promise.reject<T>( NetworkException.fromResponse(response) );
    }
}

export async function postRequest<T, A>(url : string, request : models.Action<A>, access_token?: string) : Promise<T>
{
    url = urls.API_URL + url;
    let options = getBackendFetchOptions('POST', access_token);
    options = {
        ...options,
        body: JSON.stringify(request)
    }

    let response = await fetch(url, options);
    
    if (response.ok)
    {
        return await response.json();
    }
    else
    {
        return Promise.reject<T>( NetworkException.fromResponse(response) );
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

export function wrapReducerAction<T>( action : string, payload : T ) : string
{
    let reducerAction : models.Action< models.Action< T > > =
    {
        type : models.SocketAction.REDUCER_ACTION,
        payload:
        {
            type: action,
            payload: payload
        }
    }

    return JSON.stringify( reducerAction );
}



