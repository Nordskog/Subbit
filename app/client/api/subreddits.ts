
import * as urls from '~/common/urls'
import * as tools from '~/common/tools'
import * as serverActions from '~/backend/actions'
import * as models from '~/common/models'
import * as api from '~/common/api'

export function fetchSubreddits() : Promise<models.data.Subreddit[]>
{
    return api.rfy.getRequest(
        '/subreddits', 
        {

        }   );
}

export function fetchManagedSubreddits( access_token: string) : Promise<models.data.Subreddit[]>
{
    return api.rfy.getRequest(
        '/subreddits', 
        {
            "scrape_job": "true"
        },
        access_token    );
}


export function addSubreddit( subreddit : string, access_token: string)
{
    return api.rfy.postRequest(
        '/subreddits', 
        {
            type :    serverActions.subreddit.ADD_SUBREDDIT,
            payload : < serverActions.subreddit.ADD_SUBREDDIT >
            {
                subreddit : subreddit
            }
        },
        access_token );
}

export function removeSubreddit( subreddit_id :  number, access_token: string)
{
    return api.rfy.postRequest(
        '/subreddits', 
        {
            type :    serverActions.subreddit.REMOVE_SUBREDDIT,
            payload : < serverActions.subreddit.REMOVE_SUBREDDIT >
            {
                id : subreddit_id
            }
        },
        access_token );
}

export function setSubredditAutoScrape( subreddit_id : number, enabled : boolean, access_token: string)
{
    return api.rfy.postRequest(
        '/subreddits', 
        {
            type :    serverActions.subreddit.SET_AUTO_SCRAPE_STATE,
            payload : < serverActions.subreddit.SET_AUTO_SCRAPE_STATE >
            {
                id : subreddit_id,
                enabled : enabled

            }
        },
        access_token );
}