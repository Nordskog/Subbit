import * as models from '~/common/models'
import * as urls from '~/common/urls'
import * as tools from '~/common/tools'


export async function getRequest<T>(url : string, parameters? : any, access_token?: string) : Promise<T>
{
    url = urls.API_URL + url;
    url = tools.url.appendUrlParameters(url,parameters);
    let options = urls.getBackendFetchOptions('GET', access_token);

    let response = await fetch(url, options);
    if (response.ok)
    {
        return await response.json();
    }
    else
    {
        return Promise.reject<T>(response);
    }
}

export async function postRequest<T, A>(url : string, request : models.Action<A>, access_token?: string) : Promise<T>
{
    url = urls.API_URL + url;
    let options = urls.getBackendFetchOptions('POST', access_token);
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
        return Promise.reject<T>(response);
    }
    
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



