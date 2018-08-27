
import * as api from '~/common/api';
import * as actions from '~/client/actions';
import * as models from '~/common/models';
import * as tools from '~/common/tools';

import { State } from '~/client/store';
import { WrapWithHandler } from '~/client/actions/tools/error';
import { Dispatch, GetState } from '~/client/actions/tools/types';
import { Subscription } from '~/common/models/data';

export function fetchSubscriptions( loadFromSession : boolean = false)
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState) =>
    {
        let subscriptions : models.data.Subscription[];
        
        if (loadFromSession)
        {
            subscriptions = actions.directActions.session.loadSubscriptions();
        }


        if (subscriptions == null)
        {
            let state: State = getState();
            let token: string = tools.store.getAccessToken(state);
    
            // No user, no subscriptions
            if (token == null)
                return;
    
            subscriptions = await api.rfy.subscription.fetchSubscriptions( token);
        }

        dispatch({
            type: actions.types.subscription.SUBSCRIPTIONS_FETCHED,
            payload: subscriptions as actions.types.subscription.SUBSCRIPTIONS_FETCHED
        });

        // Dispatches should by synchronous, so state should be updated when we reach this.
        actions.directActions.session.saveSubscriptions(getState);
    });
}

export function subscribeToAuthorAction(author : string, subreddits : string[])
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState) =>
    {
        let state: State = getState();

        let user: string = tools.store.getUsername(state);
        let token: string = tools.store.getAccessToken(state);

        // Dispatch dummy subscription to immediately update ui
        // When we receive a reply with a sub id from the server we dispatch another update
        // and the ui will display the manage subscribed subreddits button.
        {
            let dummySubscription : Subscription = getDummySubscription(author, null, null, ...subreddits);
            dispatch({
                type: actions.types.subscription.TEMPORARY_SUBSCRIPTION_ADDED,  // Temporary, has no id
                payload: dummySubscription as actions.types.subscription.TEMPORARY_SUBSCRIPTION_ADDED
            });
        }

        // Await actual response from server and dispatch when received
        let subscription : models.data.Subscription = await api.rfy.subscription.subscribe(user, author, token, subreddits);
        dispatch({
            type: actions.types.subscription.SUBSCRIPTION_ADDED,
            payload: subscription as actions.types.subscription.SUBSCRIPTION_ADDED
        });

        // Dispatches should by synchronous, so state should be updated when we reach this.
        actions.directActions.session.saveSubscriptions(getState);
    });
}

export function unsubscribeFromAuthor(subscription: models.data.Subscription)
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState) =>
    {
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        // No point in awaiting this
        api.rfy.subscription.unsubscribe(subscription.id, token);

        dispatch({
            type: actions.types.subscription.SUBSCRIPTION_REMOVED,
            payload: subscription as actions.types.subscription.SUBSCRIPTION_REMOVED
        });

        // Dispatches should by synchronous, so state should be updated when we reach this.
        actions.directActions.session.saveSubscriptions(getState);
    });
}

export function addSubredditToSubscriptionAction(existingSubscription : Subscription, subredditName : string)
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState) =>
    {
        let state: State = getState();

        let token: string = tools.store.getAccessToken(state);

        // Dispatch dummy subscription to immediately update ui
        // This will not be updated later
        {
            let dummySubscription : Subscription = getDummySubscription(null, existingSubscription, null, subredditName);
            dispatch({
                type: actions.types.subscription.SUBSCRIPTION_CHANGED,
                payload: dummySubscription as actions.types.subscription.SUBSCRIPTION_CHANGED
            });
        }

        // Dispatches should by synchronous, so state should be updated when we reach this.
        actions.directActions.session.saveSubscriptions(getState);

        await api.rfy.subscription.addSubreddit(existingSubscription.id, subredditName, token);

    });
}

export function removeSubredditFromSubscriptionAction(existingSubscription : Subscription, subredditName : string)
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState) =>
    {
        let state: State = getState();

        let token: string = tools.store.getAccessToken(state);

        // Dispatch dummy subscription to immediately update ui
        // This will not be updated later
        {
            let dummySubscription : Subscription = getDummySubscription(null, existingSubscription, subredditName );
            dispatch({
                type: actions.types.subscription.SUBSCRIPTION_CHANGED,
                payload: dummySubscription as actions.types.subscription.SUBSCRIPTION_CHANGED
            });
        }

        // Dispatches should by synchronous, so state should be updated when we reach this.
        actions.directActions.session.saveSubscriptions(getState);

        await api.rfy.subscription.removeSubreddit(existingSubscription.id, subredditName, token);
        
    });
}


//////////////////////
// Utility
///////////////////////

function getDummySubscription( author : string, existingSubscription : Subscription,  removeSubreddit : string, ...newSubreddits : string[])
{
    let id = null;
    let user = null;

    if (existingSubscription != null)
    {
        id = existingSubscription.id;
        user = existingSubscription.user;
        author = existingSubscription.author;

        for (let subSubreddit of existingSubscription.subreddits)
        {
            newSubreddits.push( subSubreddit.name );
        }
    }

    if (removeSubreddit != null )
    {
        newSubreddits = existingSubscription.subreddits
        .filter( (subsub) => subsub.name.toLowerCase() !== removeSubreddit.toLowerCase() )
        .map( (subsub) => subsub.name );
    }

    return {
        author: author,
        subscribed: true,
        id: id,
        user: user,
        subreddits: newSubreddits.map( (name) => 
            {
                return {
                    id: null,
                    name: name,
                    subscribed: true
                };
            })
    };
}
