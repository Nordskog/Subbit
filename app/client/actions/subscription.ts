
import * as api from '~/common/api'
import * as actions from '~/client/actions'
import * as models from '~/common/models'
import * as tools from '~/common/tools'

import { State } from '~/client/store';

export function fetchSubscriptions()
{
    return async function (dispatch, getState)
    {
        let state: State = getState();

        let filter: string = state.authorState.filter;
        let token: string = tools.store.getAccessToken(state);

        //No user, no subscriptions
        if (token == null)
            return;

        let subscriptions : models.data.Subscription[] = await api.rfy.subscription.fetchSubscriptions( token);

        dispatch({
            type: actions.types.subscription.SUBSCRIPTIONS_FETCHED,
            payload: subscriptions as actions.types.subscription.SUBSCRIPTIONS_FETCHED
        });
    }
}

export function subscribeToAuthorAction(author : string, subreddit? : string)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();

        let filter: string = state.authorState.filter;
        let user: string = tools.store.getUsername(state);
        let token: string = tools.store.getAccessToken(state);

        let subscription : models.data.Subscription = await api.rfy.subscription.subscribe(user, author, token, subreddit);

        dispatch({
            type: actions.types.subscription.SUBSCRIPTION_ADDED,
            payload: subscription as actions.types.subscription.SUBSCRIPTION_ADDED
        });
    }
}

export function unsubscribeFromAuthor(subscription: models.data.Subscription)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        let success : boolean = await api.rfy.subscription.unsubscribe(subscription.id, token);

        dispatch({
            type: actions.types.subscription.SUBSCRIPTION_REMOVED,
            payload: subscription as actions.types.subscription.SUBSCRIPTION_REMOVED
        });
    }
}

export function addSubredditToSubscriptionAction(subscription_id : number, subreddit_name : string)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();

        let filter: string = state.authorState.filter;
        let user: string = tools.store.getUsername(state);
        let token: string = tools.store.getAccessToken(state);

        let subscription : models.data.Subscription = await api.rfy.subscription.addSubreddit(subscription_id, subreddit_name, token);

        dispatch({
            type: actions.types.subscription.SUBSCRIPTION_CHANGED,
            payload: subscription as actions.types.subscription.SUBSCRIPTION_CHANGED
        });
    }
}

export function removeSubredditFromSubscriptionAction(subscription_id : number, subreddit_name : string)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();

        let filter: string = state.authorState.filter;
        let user: string = tools.store.getUsername(state);
        let token: string = tools.store.getAccessToken(state);

        let subscription : models.data.Subscription = await api.rfy.subscription.removeSubreddit(subscription_id, subreddit_name, token);
  
        dispatch({
            type: actions.types.subscription.SUBSCRIPTION_CHANGED,
            payload: subscription as actions.types.subscription.SUBSCRIPTION_CHANGED
        });
        
    }
}


