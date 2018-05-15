
const RFY_ADDRESS = '127.0.0.1:8080';
export const RFY_URL = 'http://'+RFY_ADDRESS;
const RFY_WEBSOCKET = 'ws://'+RFY_ADDRESS+'/api/socket';
export const RFY_WEBSOCKET_MANAGER = RFY_WEBSOCKET+'/manager';
export const API_URL = RFY_URL +'/api';

export const REDDIT_URL = 'https://www.reddit.com'
export const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/authorize';


export const REDDIT_OAUTH_API_URL = "https://oauth.reddit.com";

import * as config from '~/config';


export function getLogoutUrl()
{
    return API_URL+'/logout'
}

export function getPostUrl(subreddit : string, post_id: string) : string
{
    return REDDIT_URL + '/r/' + subreddit + '/comments/' + post_id;
}

export function getLoginUrl()
{
    return API_URL+"/authorize_remote";
}

export function getLocalAuthUrl()
{
    return RFY_URL+'/authenticate'
}

export function getLastVisitUrl()
{
    return API_URL+"/user/last_visit";
}

export function getRedditTokenRefreshUrl()
{
    return API_URL+"/authorize_refresh";
}



    


