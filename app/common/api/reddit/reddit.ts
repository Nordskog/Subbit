

import * as models from '~/common/models'
import { reddit } from '~/common/models'
import * as tools from '~/common/tools'
import * as apiTools from './apiTools'

import * as urls from '~/common/urls'


import * as fetch from 'isomorphic-fetch';


const apiQueue = new tools.FetchQueue(3);   // Will receive ratelimit header
const cdnQueue = new tools.FetchQueue(11);   // Will not receive ratelimit header

export const POST_FULLNAME_PREFIX = "t3_";

export async function getUsername( auth : models.auth.RedditAuth )
{
    let url = urls.REDDIT_OAUTH_API_URL + "/api/v1/me";

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

export async function getPosts(author: string, after : string, auth : models.auth.RedditAuth, count : number,  ...subreddits : string[], ) : Promise< { posts : models.reddit.Post[], after : string } >
{

    let url = urls.REDDIT_URL;
    url = getPostsUrl(author, after, count, ...subreddits);

    console.log("Fetching url:",url);

    //No oauth because hitting cdn cached
    let config = {
        method: "GET",
        header: {   'User-Agent': 'RFY crawler',
        'Content-Type': 'application/json' }
        };

    let response : Response;
    if (auth == null)
        response = await cdnQueue.enqueue( () => fetch(url, config) );
    else
        response = await apiQueue.enqueue( () => fetch(url, config) );

    if (response.ok)
    {   
        let result : reddit.ListingResponse = await response.json();


        let posts : models.reddit.Post[] = result.data.children.map( ( post : reddit.Thing<reddit.Post> ) => 
        {
            return post.data
        });

        //Filter stickied posts for now. TODO: think about stickies
        posts = posts.filter( ( post : models.reddit.Post ) => { return !post.stickied } );

        return { posts: posts,  after: result.data.after };
    }
    else
    {
        console.log("Respone code: "+response.status+", msg: "+response.statusText);
        return { posts: [],  after: null };
    }
}

export async function getAuthors(subreddit? : string, filter? : models.AuthorFilter, after? : string, count? : number, auth? : models.auth.RedditAuth, ) : Promise< { authors : models.data.Author[], after : string } >
{
 
    let url = urls.REDDIT_URL;
    url = apiTools.getFilterUrl(subreddit, filter);

    url = url+'.json';  //CDN requires json extension, ignores header

    url = tools.url.appendUrlParameters(url, { after: after, limit : count });

    console.log("Fetching url:",url);

    //No oauth because hitting cdn cached
    let config = {
        method: "GET",
        header: {   'User-Agent': 'RFY crawler',
        'Content-Type': 'application/json' }
        };

    let response : Response;
    if (auth == null)
        response = await cdnQueue.enqueue( () => fetch(url, config) );
    else
        response = await apiQueue.enqueue( () => fetch(url, config) );

    if (response.ok)
    {   
        let result : reddit.ListingResponse = await response.json();

        if (filter == models.AuthorFilter.HOT)
        {
            //Stickied posts are always at the top of the list in hot. Remove them for now.
            //TODO think about stickies
            result.data.children = result.data.children.filter( ( post : reddit.Thing<reddit.Post> ) => { return !post.data.stickied } );
        }

        let authors : models.data.Author[] = result.data.children.map( ( post : reddit.Thing<reddit.Post> ) => 
        {
            return {
                id: -1, //Not provided here
                name: post.data.author,
                last_post_date: post.data.created_utc,   //As far as this listing is concerned
                posts : [],
                post_count : 0,  //hmmm
                subscriptions: []
            }
        });

        //Remove duplicates, prioritizing lower-index authors
        let authorNameSet = new Set<string>();
        authors = authors.filter( ( author : models.data.Author ) => 
        {
            if (authorNameSet.has( author.name ))
            {
                return false;
            }
            else
            {
                authorNameSet.add(author.name);
                return true;
            }
        } );

        return { authors: authors,  after: result.data.after };
    }
    else
    {
        console.log("Respone code: "+response.status+", msg: "+response.statusText);
        return { authors: [],  after: null };
    }
}

export async function getPostInfo(auth : models.auth.RedditAuth,  postIds : string[])
{
    postIds = postIds.map( entry => POST_FULLNAME_PREFIX+entry );  
    let url = urls.REDDIT_OAUTH_API_URL + "/by_id/" + postIds.join();

    let config = {
        method: "GET",
        headers: getOauthHeader(auth)
        };

    let response : Response = await apiQueue.enqueue( () => fetch(url, config) );

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

function getPostsUrl(author : string, after : string, limit : number,  ...subreddits : string[]) : string
{
    let url = urls.REDDIT_URL;
    if (subreddits == null || subreddits.length < 1)
    {
        url = url + '/user/'+author+'/submitted.json'

        url = tools.url.appendUrlParameters(url,
            {
                sort: 'new',
                after: after,
                limit: limit
            }
        );
    }
    else
    {
        url = url + '/r/'+subreddits.join('+')+'/search.json'

        url = tools.url.appendUrlParameters(url,
            {
                restrict_sr: 'on',
                include_over_18: 'on',
                q: 'author:'+author,
                sort: 'new',
                after: after,
                limit: limit
            }
        );
    }

    return url;
}

