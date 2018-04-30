

import * as models from '~/common/models'
import * as tools from '~/common/tools'
import * as queue from '~/client/api/redditQueue/queue';


import * as fetch from 'isomorphic-fetch';

export const REDDIT_OAUTH_API_URL = "https://oauth.reddit.com";
export const POST_FULLNAME_PREFIX = "t3_";


export async function getUsername( auth : models.auth.RedditAuth )
{


    let url = REDDIT_OAUTH_API_URL + "/api/v1/me";

    let config = {
        method: "GET",
        headers: getOauthHeader(auth)
        };

    let response : Response = await fetch(url, config);


    if (response.ok)
    {   
        let result = await response.json();
        return result.name;
    }
    else
    {
        return undefined;
    }
}

export async function getPostInfo(auth : models.auth.RedditAuth,  postIds : string[])
{
    postIds = postIds.map( entry => POST_FULLNAME_PREFIX+entry );  
    let url = REDDIT_OAUTH_API_URL + "/by_id/" + postIds.join();

    let config = {
        method: "GET",
        headers: getOauthHeader(auth)
        };

    let response : Response = await queue.enqueue( () => fetch(url, config) );

    if (response.ok)
    {   
        let result = await response.json();
        return result.data.children.map( post => { return post.data } );
        
    }
    else
    {
        console.log("Respone code: "+response.status+", msg: "+response.statusText);
        return [];
    }
}

export function getOauthHeader( auth : models.auth.RedditAuth )
{
    return { "Authorization" : 'bearer ' + auth.access_token };
}

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

