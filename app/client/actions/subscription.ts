﻿
import * as api from '~/common/api'
import * as actions from '~/client/actions'
import * as models from '~/common/models'
import * as tools from '~/common/tools'

import { State } from '~/client/store';
import { WrapWithHandler } from '~/client/actions/tools/error';
import { Dispatch, GetState } from '~/client/actions/tools/types';
import { Subscription } from '~/common/models/data';

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

        //Dispatch dummy subscription to immediately update ui
        //When we receive a reply with a sub id from the server we dispatch another update
        //and the ui will display the manage subscribed subreddits button.
        {
            let dummySubscription : Subscription = getDummySubscription(author, null, null, ...subreddits);
            dispatch({
                type: actions.types.subscription.SUBSCRIPTION_ADDED,
                payload: dummySubscription as actions.types.subscription.SUBSCRIPTION_ADDED
            });
        }

        //Await actual response from server and dispatch when received
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

        //No point in awaiting this
        api.rfy.subscription.unsubscribe(subscription.id, token);

        dispatch({
            type: actions.types.subscription.SUBSCRIPTION_REMOVED,
            payload: subscription as actions.types.subscription.SUBSCRIPTION_REMOVED
        });
    });
}

export function addSubredditToSubscriptionAction(existingSubscription : Subscription, subreddit_name : string)
{
    return WrapWithHandler( async function (dispatch : Dispatch, getState : GetState)
    {
        let state: State = getState();

        let filter: string = state.authorState.filter;
        let user: string = tools.store.getUsername(state);
        let token: string = tools.store.getAccessToken(state);

        //Dispatch dummy subscription to immediately update ui
        //This will not be updated later
        {
            let dummySubscription : Subscription = getDummySubscription(null, existingSubscription, null, subreddit_name);
            dispatch({
                type: actions.types.subscription.SUBSCRIPTION_CHANGED,
                payload: dummySubscription as actions.types.subscription.SUBSCRIPTION_CHANGED
            });
        }

        let subscription : models.data.Subscription = await api.rfy.subscription.addSubreddit(existingSubscription.id, subreddit_name, token);

    });
}

export function removeSubredditFromSubscriptionAction(existingSubscription : Subscription, subreddit_name : string)
{
    return WrapWithHandler(  async function (dispatch : Dispatch, getState : GetState)
    {
        let state: State = getState();

        let filter: string = state.authorState.filter;
        let user: string = tools.store.getUsername(state);
        let token: string = tools.store.getAccessToken(state);

        //Dispatch dummy subscription to immediately update ui
        //This will not be updated later
        {
            let dummySubscription : Subscription = getDummySubscription(null, existingSubscription, subreddit_name );
            dispatch({
                type: actions.types.subscription.SUBSCRIPTION_CHANGED,
                payload: dummySubscription as actions.types.subscription.SUBSCRIPTION_CHANGED
            });
        }

        let subscription : models.data.Subscription = await api.rfy.subscription.removeSubreddit(existingSubscription.id, subreddit_name, token);
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
        .filter( (subsub) => subsub.name.toLowerCase() != removeSubreddit.toLowerCase() )
        .map( subsub => subsub.name );
    }

    return {
        author: author,
        subscribed: true,
        id: id,
        user: user,
        subreddits: newSubreddits.map( name => 
            {
                return {
                    id: null,
                    name: name,
                    subscribed: true
                }
            })
    }
}