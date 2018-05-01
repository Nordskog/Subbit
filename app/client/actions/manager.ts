import { State } from '~/client/store';

import { AuthorFilter } from '~/common/models';
import * as api from '~/common/api'
import * as actions from '~/client/actions'
import * as models from '~/common/models'
import * as tools from '~/common/tools'
import * as cache from '~/client/cache'
import * as serverActions from '~/backend/actions'
import * as config from '~/config'
import * as websocket from '~/client/websocket'

import * as authority from '~/client/authority'

export function getManagedSubreddits()
{
    return async function (dispatch, getState)
    {
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        let subreddits : models.data.Subreddit[] = await api.rfy.subreddits.fetchManagedSubreddits(token)
        
        dispatch({
            type: actions.types.manager.FETCH_SUBREDDITS_COMPLETED,
            payload: subreddits as actions.types.manager.FETCH_SUBREDDITS_COMPLETED
        });
    }
}

export function requestScrape( payload : serverActions.scrape.REQUEST_SCRAPE)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        let job : models.data.ScrapeJob = await api.rfy.scrape.requestScrapeJob(payload,token)
        
        dispatch({
            type: actions.types.manager.SCRAPE_JOBS_UPDATED,
            payload: [job] as actions.types.manager.SCRAPE_BOT_UPDATED
        });
    }
}

export function getUpdatedJobs( after : number)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        let jobs : models.data.ScrapeJob[] = await api.rfy.scrape.requestScrapeJobUpdate(after,token)
        
        if (jobs.length > 0)
        {
            dispatch({
                type: actions.types.manager.SCRAPE_JOBS_UPDATED,
                payload: jobs as actions.types.manager.SCRAPE_BOT_UPDATED
            });
        }
    }
}

export function cancelScrape( job_id : number)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        let job : models.data.ScrapeJob = await api.rfy.scrape.cancelScrapeJob(job_id,token)

        dispatch({
            type: actions.types.manager.SCRAPE_JOBS_UPDATED,
            payload: [job] as actions.types.manager.SCRAPE_JOBS_UPDATED
        });
    }
}

export function toggleScrapeBot( enabled : boolean)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        let bot : models.data.ScrapeBot = await api.rfy.scrape.toggleScrapeBot(enabled,token)

        dispatch({
            type: actions.types.manager.SCRAPE_BOT_UPDATED,
            payload: bot as actions.types.manager.SCRAPE_BOT_UPDATED
        });
    }
}

export function setScrapeBotInterval( interval : number)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        let bot : models.data.ScrapeBot = await api.rfy.scrape.setScrapeBotInterval(interval,token)

        dispatch({
            type: actions.types.manager.SCRAPE_BOT_UPDATED,
            payload: bot as actions.types.manager.SCRAPE_BOT_UPDATED
        });
    }
}

export function setScrapeBotConcurrentRequests( concurrent_requests : number)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        let bot : models.data.ScrapeBot = await api.rfy.scrape.setScrapeBotConcurrentRequests(concurrent_requests,token)

        dispatch({
            type: actions.types.manager.SCRAPE_BOT_UPDATED,
            payload: bot as actions.types.manager.SCRAPE_BOT_UPDATED
        });
    }
}

export function modifyScrapeJobLocally( modifiedJob : models.data.ScrapeJob )
{
    return async function (dispatch, getState)
    {
        // Whenever a job is modified locally, its status should be changed to modified
        modifiedJob.status = models.ScrapeStatus.MODIFIED;
        let jobs : models.data.ScrapeJob[] = [modifiedJob];
    
        dispatch({
            type: actions.types.manager.SCRAPE_JOBS_UPDATED,
            payload: jobs as actions.types.manager.SCRAPE_JOBS_UPDATED
        });
    }
}

export function pruneAuthorsWithNoPosts(subreddit_id? : number)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        await api.rfy.authors.pruneAuthorsWithNoPosts(subreddit_id,token);
    }
}

export function scrapeBotScrapeNow()
{
    return async function (dispatch, getState)
    {
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        await api.rfy.scrape.scrapeBotScrapeNow(token);
    }
}

