import { State } from '~/client/store';
import * as api from '~/client/api'
import * as actions from '~/client/actions'
import * as models from '~/common/models'
import * as tools from '~/common/tools'

export function removeSubreddit(subreddit : models.data.Subreddit)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();

        let filter: string = state.authorState.filter;
        let token: string = tools.store.getAccessToken(state);

        let deleted = await api.subreddits.removeSubreddit(subreddit.id, token);
  
        if (deleted)
        {

            dispatch({
                type: actions.types.manager.SUBREDDIT_REMOVED,
                payload: subreddit as actions.types.manager.SUBREDDIT_REMOVED
            });
        }
    }
}

export function addSubreddit(subreddit_name : string)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();

        let filter: string = state.authorState.filter;
        let token: string = tools.store.getAccessToken(state);

        let subreddit : models.data.Subreddit = await api.subreddits.addSubreddit(subreddit_name, token);
  
        dispatch({
            type: actions.types.manager.SUBREDDIT_ADDED,
            payload: subreddit as actions.types.manager.SUBREDDIT_ADDED
        });
        
    }
}

export function setSubredditAutoscrape(subreddit_id : number, enabled : boolean)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();

        let filter: string = state.authorState.filter;
        let token: string = tools.store.getAccessToken(state);

        await api.subreddits.setSubredditAutoScrape(subreddit_id, enabled, token);
  
        dispatch({
            type: actions.types.manager.SUBREDDIT_MODIFIED,
            payload: {
                id: subreddit_id,
                autoscrape: enabled
            } as actions.types.manager.SUBREDDIT_MODIFIED
        });
        
    }
}
