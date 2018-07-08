import * as models from '~/common/models'
import { reddit } from '~/common/models'

import * as apiTools from './apiTools'
import * as urls from '~/common/urls'
import * as tools from '~/common/tools'

import * as api from '~/common/api'
import { NetworkException } from '~/common/exceptions';

export async function authenticateWithCode(code : string, redirect : string, appBasicAuthHeader )
{
    let config = {
        method: 'POST',
        headers: appBasicAuthHeader,
        body: tools.url.formatAsPostForm( {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect })
    }

    let response : Response = await fetch("https://www.reddit.com/api/v1/access_token", config);

    if(response.ok)
    {
        return await response.json();
    }
    else
    {
        throw await NetworkException.fromResponse(response);
    }
}

export async function authenticateAsClient(appBasicAuthHeader )
{
    let config = {
        method: 'POST',
        headers: appBasicAuthHeader,
        body: tools.url.formatAsPostForm( {
            "grant_type": "client_credentials" })
    }

    let response : Response = await fetch("https://www.reddit.com/api/v1/access_token", config);

    if(response.ok)
    {
        return await response.json();
    }
    else
    {
        throw await NetworkException.fromResponse(response);
    }
}

export async function authenticatedWithRefreshToken(token : string, appBasicAuthHeader )
{
    let config = {
        method: 'POST',
        headers: appBasicAuthHeader,
        body: tools.url.formatAsPostForm( {
            "grant_type": "refresh_token",
            "refresh_token": token
         })
    }

    let response : Response = await fetch("https://www.reddit.com/api/v1/access_token", config);
    
    if(response.ok)
    {
        return await response.json();
    }
    else
    {
        throw await NetworkException.fromResponse(response);
    }
}

export async function getUsername( auth : models.auth.RedditAuth )
{
    let result : { name : string } = < { name : string } > await api.reddit.getRequest(
    urls.REDDIT_OAUTH_API_URL + "/api/v1/me",
    {

    },
    auth);

    

    return result.name;
}
