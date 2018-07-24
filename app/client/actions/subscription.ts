
import * as api from '~/common/api'
import * as actions from '~/client/actions'
import * as models from '~/common/models'
import * as tools from '~/common/tools'

import { State } from '~/client/store';
import { WrapWithHandler } from '~/client/actions/tools/error';
import { Dispatch, GetState } from '~/client/actions/tools/types';

export function fetchSubscriptions( loadFromSession : boolean = false)
{
    return WrapWithHandler( async function (dispatch : Dispatch, getState : GetState)
    {
        let subscriptions : models.data.Subscription[];
        
        if (loadFromSession)
            subscriptions = actions.directActions.session.loadSubscriptions();

        if (subscriptions == null)
        {
            let state: State = getState();
            let token: string = tools.store.getAccessToken(state);
    
            //No user, no subscriptions
            if (token == null)
                return;
    
            subscriptions = await api.rfy.subscription.fetchSubscriptions( token);
            actions.directActions.session.saveSubscriptions(subscriptions);
        }

        dispatch({
            type: actions.types.subscription.SUBSCRIPTIONS_FETCHED,
            payload: subscriptions as actions.types.subscription.SUBSCRIPTIONS_FETCHED
        });
    });
}

export function subscribeToAuthorAction(author : string, subreddits : string[])
{
    return WrapWithHandler( async function (dispatch : Dispatch, getState : GetState)
    {
        let state: State = getState();

        let user: string = tools.store.getUsername(state);
        let token: string = tools.store.getAccessToken(state);

        let subscription : models.data.Subscription = await api.rfy.subscription.subscribe(user, author, token, subreddits);

        dispatch({
            type: actions.types.subscription.SUBSCRIPTION_ADDED,
            payload: subscription as actions.types.subscription.SUBSCRIPTION_ADDED
        });
    });
}

export function unsubscribeFromAuthor(subscription: models.data.Subscription)
{
    return WrapWithHandler(  async function (dispatch : Dispatch, getState : GetState)
    {
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        let success : boolean = await api.rfy.subscription.unsubscribe(subscription.id, token);

        dispatch({
            type: actions.types.subscription.SUBSCRIPTION_REMOVED,
            payload: subscription as actions.types.subscription.SUBSCRIPTION_REMOVED
        });
    });
}

export function addSubredditToSubscriptionAction(subscription_id : number, subreddit_name : string)
{
    return WrapWithHandler( async function (dispatch : Dispatch, getState : GetState)
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
    });
}

export function removeSubredditFromSubscriptionAction(subscription_id : number, subreddit_name : string)
{
    return WrapWithHandler(  async function (dispatch : Dispatch, getState : GetState)
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
        
    });
}


