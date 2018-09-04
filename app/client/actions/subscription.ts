
import * as api from '~/common/api';
import * as actions from '~/client/actions';
import * as models from '~/common/models';
import * as tools from '~/common/tools';
import config from 'root/config';

import { State } from '~/client/store';
import { WrapWithHandler, handleError } from '~/client/actions/tools/error';
import { Dispatch, GetState } from '~/client/actions/tools/types';
import { Subscription } from '~/common/models/data';
import { NetworkException, LogOnlyException } from '~/common/exceptions';
import { toast, ToastType } from "~/client/toast";

export function fetchSubscriptions( loadFromSession : boolean = false)
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState) =>
    {
        let subscriptions : models.data.Subscription[];
        
        if (loadFromSession)
        {
            subscriptions = actions.directActions.session.loadSubscriptions();
        }

        try 
        {
            if (subscriptions == null)
            {
                let state: State = getState();
                let token: string = tools.store.getAccessToken(state);
        
                // No user, no subscriptions
                if (token == null)
                    return;
        
                subscriptions = await api.rfy.subscription.fetchSubscriptions( token);

            }
        }
        catch ( err )
        {
            // Rethrow if invald login
            if ( err instanceof NetworkException)
            {
                // User will be logged out
                if ( err.code === 401 )
                {
                    throw(err);
                }
            }

            // Otherwise attempt to fall back to stored subscriptions
            // This basically means cloudflare can serve subbit when our servers are down
            // and most everything will work fine.
            subscriptions = actions.directActions.storage.loadSubscriptions();

            if (subscriptions == null)
            {
                // No subscriptions stored locally, just throw the original error.
                throw err;
            }
            else
            {
                // Silently log the error and inform user that we're using stored subs.
                handleError(dispatch, new LogOnlyException( "Using stored subscriptions", err ));
                toast( ToastType.ERROR, 10000, `Could not connect to ${config.client.siteName}`, "Loaded subscriptions from previous session");     
            }
        }

        if ( subscriptions != null )
        {

            dispatch({
                type: actions.types.subscription.SUBSCRIPTIONS_FETCHED,
                payload: subscriptions as actions.types.subscription.SUBSCRIPTIONS_FETCHED
            });
    
    
            // Dispatches should by synchronous, so state should be updated when we reach this.
            actions.directActions.session.saveSubscriptions(getState);
            actions.directActions.storage.saveSubscriptions(getState);
        }

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
        
        let dummySubscription : Subscription = Subscription.getNew(author, null, null, ...subreddits);
        dispatch({
            type: actions.types.subscription.TEMPORARY_SUBSCRIPTION_ADDED,  // Temporary, has no id
            payload: dummySubscription as actions.types.subscription.TEMPORARY_SUBSCRIPTION_ADDED
        });
        

        try 
        {
            // Await actual response from server and dispatch when received
            let subscription : models.data.Subscription = await api.rfy.subscription.subscribe(user, author, token, subreddits);
            dispatch({
                type: actions.types.subscription.SUBSCRIPTION_ADDED,
                payload: subscription as actions.types.subscription.SUBSCRIPTION_ADDED
            });

            // Dispatches should by synchronous, so state should be updated when we reach this.
            actions.directActions.session.saveSubscriptions(getState);
            actions.directActions.storage.saveSubscriptions(getState);
        }
        catch ( err )
        {
            // Something went wrong, remove subscription
            dispatch({
                type: actions.types.subscription.SUBSCRIPTION_REMOVED,
                payload: dummySubscription as actions.types.subscription.SUBSCRIPTION_REMOVED
            });

            throw err;
        }

    });
}

export function unsubscribeFromAuthor(subscription: models.data.Subscription)
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState) =>
    {
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        dispatch({
            type: actions.types.subscription.SUBSCRIPTION_REMOVED,
            payload: subscription as actions.types.subscription.SUBSCRIPTION_REMOVED
        });

        try
        {
            // We await this so we can catch any problems 
            await api.rfy.subscription.unsubscribe(subscription.id, token);

            // Don't save until response received.
            actions.directActions.session.saveSubscriptions(getState);
            actions.directActions.storage.saveSubscriptions(getState);
        }
        catch ( err )
        {
            // This normally expects there to be temporary subscription to remove,
            // but it will fall back to just adding it to the list.
            // Will keep us from accidentally adding duplicate subscriptions too.
            dispatch({
                type: actions.types.subscription.SUBSCRIPTION_ADDED,
                payload: subscription as actions.types.subscription.SUBSCRIPTION_ADDED
            });

            throw err;
        }
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
            let dummySubscription : Subscription = Subscription.getNew(null, existingSubscription, null, subredditName);
            dispatch({
                type: actions.types.subscription.SUBSCRIPTION_CHANGED,
                payload: dummySubscription as actions.types.subscription.SUBSCRIPTION_CHANGED
            });
        }

        try
        {
            await api.rfy.subscription.addSubreddit(existingSubscription.id, subredditName, token);

            // Dispatches should by synchronous, so state should be updated when we reach this.
            actions.directActions.session.saveSubscriptions(getState);
            actions.directActions.storage.saveSubscriptions(getState);
        }
        catch ( err )
        {
            // We'd return the dummy subscription, but the user may make multiple changes while we wait for the serve to respond.
            dispatch({
                type: actions.types.subscription.SUBSCRIPTION_SUBREDDIT_REMOVED,
                payload: { id: existingSubscription.id, subreddit: subredditName } as actions.types.subscription.SUBSCRIPTION_SUBREDDIT_REMOVED
            });

            throw( err );
        }
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
            let dummySubscription : Subscription = Subscription.getNew(null, existingSubscription, subredditName );
            dispatch({
                type: actions.types.subscription.SUBSCRIPTION_CHANGED,
                payload: dummySubscription as actions.types.subscription.SUBSCRIPTION_CHANGED
            });
        }

        try
        {
            await api.rfy.subscription.removeSubreddit(existingSubscription.id, subredditName, token);

            // Dispatches should by synchronous, so state should be updated when we reach this.
            actions.directActions.session.saveSubscriptions(getState);
            actions.directActions.storage.saveSubscriptions(getState);
        }
        catch ( err )
        {
            // We'd return the dummy subscription, but the user may make multiple changes while we wait for the serve to respond.
            dispatch({
                type: actions.types.subscription.SUBSCRIPTION_SUBREDDIT_ADDED,
                payload: { id: existingSubscription.id, subreddit: subredditName } as actions.types.subscription.SUBSCRIPTION_SUBREDDIT_ADDED
            });

            throw( err );
        }
    });
}

