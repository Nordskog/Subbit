
const RFY_ADDRESS = '127.0.0.1:8080';
export const RFY_URL = 'http://'+RFY_ADDRESS;
const RFY_WEBSOCKET = 'ws://'+RFY_ADDRESS+'/api/socket';
export const RFY_WEBSOCKET_MANAGER = RFY_WEBSOCKET+'/manager';
export const API_URL = RFY_URL +'/api';

export const REDDIT_URL = 'https://www.reddit.com'
export const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/authorize';

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

export function getLastVisitUrl()
{
    return API_URL+"/user/last_visit";
}

export function getRedditTokenRefreshUrl()
{
    return API_URL+"/authorize_refresh";
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

    


