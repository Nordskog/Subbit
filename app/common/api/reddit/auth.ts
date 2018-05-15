import * as models from '~/common/models'
import { reddit } from '~/common/models'

import * as apiTools from './apiTools'
import * as urls from '~/common/urls'
import * as tools from '~/common/tools'

import * as api from '~/common/api'

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

    console.log("Sending authentication code");
    let response : Response = await fetch("https://www.reddit.com/api/v1/access_token", config);

    if(response.ok)
    {
        return await response.json();
    }
    else
    {
        let fetchError = "Auth error: " + JSON.stringify(response.status)+JSON.stringify(response.statusText);
        console.log(fetchError);
        return null;
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
        let fetchError = "Auth error: " + JSON.stringify(response.status)+JSON.stringify(response.statusText);
        console.log(fetchError);
        return null;
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
        let fetchError = "Auth error: " + JSON.stringify(response.status)+JSON.stringify(response.statusText);
        console.log(fetchError);
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
