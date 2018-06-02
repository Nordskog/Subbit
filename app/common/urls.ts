
import * as config from '~/config';

/////////////
// Server
/////////////
const RFY_ADDRESS = '127.0.0.1:8080';
export const RFY_URL = 'http://'+RFY_ADDRESS;

const RFY_WEBSOCKET = 'ws://'+RFY_ADDRESS+'/api/socket';

export const RFY_WEBSOCKET_MANAGER = RFY_WEBSOCKET+'/manager';

/////////////
// Client
/////////////

export const RFY_AUTHORIZE_REDIRECT =  RFY_URL+'/authenticate'         //User is redirected here by reddit with access code

/////////////
// Backend
/////////////

export const RFY_API_URL = RFY_URL +'/api';
export const RFY_AUTHORIZE_LOCAL =  RFY_API_URL+'/authorize_local'      //Handles response from reddit after user is redirected back to client
export const RFY_AUTHORIZE_REMOTE =  RFY_API_URL+'/authorize_remote'    //Forwards to reddit
export const RFY_AUTHORIZE_REFRESH =  RFY_API_URL+'/authorize_refresh'  //Get new access token from backend

/////////////
// Reddit
////////////

export const REDDIT_URL = 'https://www.reddit.com'
export const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/authorize';
export const REDDIT_OAUTH_API_URL = "https://oauth.reddit.com";

export function getPostUrl(subreddit : string, post_id: string) : string
{
    return REDDIT_URL + '/r/' + subreddit + '/comments/' + post_id;
}

export function getSubredditUrl(subreddit : string)
{
    return REDDIT_URL + "/r/" + subreddit;
}


    


