
import config from 'root/config';
import * as tools from '~/common/tools';

/////////////
// Client
/////////////

export const RFY_AUTHORIZE_REDIRECT =  config.server.server_address + '/authenticate';         // User is redirected here by reddit with access code

/////////////
// Backend
/////////////

export const RFY_API_URL = config.server.server_address + '/api';
export const RFY_AUTHORIZE_LOCAL =  RFY_API_URL + '/authorize_local';                      // Handles response from reddit after user is redirected back to client
export const RFY_AUTHORIZE_REMOTE =  RFY_API_URL + '/authorize_remote';                    // Forwards to reddit
export const RFY_AUTHORIZE_REFRESH =  RFY_API_URL + '/authorize_refresh';                  // Get new access token from backend

export function getClientLoginUrl( session : boolean = false, compact : boolean = false )
{
    return tools.url.appendUrlParameters(RFY_AUTHORIZE_REMOTE, { session : session, compact : compact });
}

/////////////
// Reddit
////////////

export const REDDIT_URL = 'https://www.reddit.com';
export const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/authorize';
export const REDDIT_AUTH_URL_COMPACT = 'https://www.reddit.com/api/v1/authorize.compact';
export const REDDIT_OAUTH_API_URL = "https://oauth.reddit.com";

export function getPostUrl(subreddit : string, postId: string) : string
{
    return REDDIT_URL + '/r/' + subreddit + '/comments/' + postId;
}

export function getSubredditUrl(subreddit : string)
{
    return REDDIT_URL + "/r/" + subreddit;
}


    


