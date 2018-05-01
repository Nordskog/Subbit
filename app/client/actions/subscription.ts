
import * as api from '~/common/api'
import * as actions from '~/client/actions'
import * as models from '~/common/models'
import * as tools from '~/common/tools'

import { State } from '~/client/store';


export function subscribeToAuthorAction(author : string)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();

        let filter: string = state.authorState.filter;
        let user: string = tools.store.getUsername(state);
        let token: string = tools.store.getAccessToken(state);

        let subscription = await api.rfy.subscription.subscribe(user, author, token);

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

        let success = await api.rfy.subscription.unsubscribe(subscription.id, token);

        dispatch({
            type: actions.types.subscription.SUBSCRIPTION_REMOVED,
            payload: subscription as actions.types.subscription.SUBSCRIPTION_REMOVED
        });
    }
}

export function addSubredditToSubscriptionAction(subscriptionId : number, subredditId : number)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();

        let filter: string = state.authorState.filter;
        let user: string = tools.store.getUsername(state);
        let token: string = tools.store.getAccessToken(state);

        let subscription = await api.rfy.subscription.addSubreddit(subscriptionId, subredditId, token);


        
        dispatch({
            type: actions.types.subscription.SUBSCRIPTION_CHANGED,
            payload: subscription as actions.types.subscription.SUBSCRIPTION_CHANGED
        });
    }
}

export function removeSubredditFromSubscriptionAction(subscriptionId : number, subredditId : number)
{
    return async function (dispatch, getState)
    {
        let state: State = getState();

        let filter: string = state.authorState.filter;
        let user: string = tools.store.getUsername(state);
        let token: string = tools.store.getAccessToken(state);

        let subscription = await api.rfy.subscription.removeSubreddit(subscriptionId, subredditId, token);
  
        dispatch({
            type: actions.types.subscription.SUBSCRIPTION_CHANGED,
            payload: subscription as actions.types.subscription.SUBSCRIPTION_CHANGED
        });
        
    }
}


